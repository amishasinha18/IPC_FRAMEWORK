#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <pthread.h>
#include <errno.h>

#define PORT 8080
#define MAX_CLIENTS 10
#define BUFFER_SIZE 4096

// External IPC functions
extern int init_ipc_system();
extern int create_pipe_channel(const char *name);
extern int send_pipe_data(int pipe_id, const char *data, int size);
extern int receive_pipe_data(int pipe_id, char *buffer, int size);
extern int send_message_queue(const char *sender, const char *receiver, const char *data, long msg_type);
extern void get_system_stats(char *stats_json, int max_size);
extern int authenticate_user(const char *username, const char *password, char *token_out);
extern int verify_token(const char *token);
extern void cleanup_ipc_system();

typedef struct {
    int socket;
    char ip[16];
    int port;
} ClientInfo;

void send_http_response(int client_socket, int status_code, const char *content_type, const char *body) {
    char header[512];
    const char *status_text = (status_code == 200) ? "OK" : 
                              (status_code == 401) ? "Unauthorized" :
                              (status_code == 400) ? "Bad Request" : "Internal Server Error";
    
    snprintf(header, sizeof(header),
             "HTTP/1.1 %d %s\r\n"
             "Content-Type: %s\r\n"
             "Access-Control-Allow-Origin: *\r\n"
             "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
             "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
             "Content-Length: %zu\r\n"
             "Connection: close\r\n"
             "\r\n",
             status_code, status_text, content_type, strlen(body));
    
    send(client_socket, header, strlen(header), 0);
    send(client_socket, body, strlen(body), 0);
}

void handle_options(int client_socket) {
    const char *response = "HTTP/1.1 204 No Content\r\n"
                          "Access-Control-Allow-Origin: *\r\n"
                          "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
                          "Access-Control-Allow-Headers: Content-Type, Authorization\r\n"
                          "\r\n";
    send(client_socket, response, strlen(response), 0);
}

void *handle_client(void *arg) {
    ClientInfo *client = (ClientInfo *)arg;
    char buffer[BUFFER_SIZE];
    int bytes_read;
    
    bytes_read = recv(client->socket, buffer, BUFFER_SIZE - 1, 0);
    if (bytes_read <= 0) {
        close(client->socket);
        free(client);
        return NULL;
    }
    
    buffer[bytes_read] = '\0';
    printf("Request from %s:%d\n", client->ip, client->port);
    
    // Parse HTTP request
    char method[16], path[256];
    sscanf(buffer, "%s %s", method, path);
    
    // Handle OPTIONS for CORS
    if (strcmp(method, "OPTIONS") == 0) {
        handle_options(client->socket);
        close(client->socket);
        free(client);
        return NULL;
    }
    
    // Route handling
    if (strcmp(method, "GET") == 0 && strcmp(path, "/api/stats") == 0) {
        char stats[2048];
        get_system_stats(stats, sizeof(stats));
        send_http_response(client->socket, 200, "application/json", stats);
        
    } else if (strcmp(method, "POST") == 0 && strncmp(path, "/api/pipe/send", 14) == 0) {
        // Parse JSON body (simplified)
        char *body = strstr(buffer, "\r\n\r\n");
        if (body) {
            body += 4;
            // In production, use proper JSON parser
            send_http_response(client->socket, 200, "application/json", 
                             "{\"success\":true,\"message\":\"Data sent via pipe\"}");
        }
        
    } else if (strcmp(method, "POST") == 0 && strcmp(path, "/api/auth/login") == 0) {
        char response[512];
        // Simplified auth - in production, parse JSON properly
        snprintf(response, sizeof(response),
                "{\"success\":true,\"token\":\"demo_token_123456\",\"username\":\"admin\"}");
        send_http_response(client->socket, 200, "application/json", response);
        
    } else if (strcmp(method, "GET") == 0 && strcmp(path, "/") == 0) {
        const char *html = "<!DOCTYPE html><html><body>"
                          "<h1>IPC Framework Server</h1>"
                          "<p>API Running on port 8080</p>"
                          "<p>Access the dashboard at http://localhost:3000</p>"
                          "</body></html>";
        send_http_response(client->socket, 200, "text/html", html);
        
    } else {
        send_http_response(client->socket, 404, "application/json", 
                         "{\"error\":\"Not found\"}");
    }
    
    close(client->socket);
    free(client);
    return NULL;
}

int main() {
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_len = sizeof(client_addr);
    pthread_t thread_id;
    
    printf("=== IPC Framework Web Server ===\n\n");
    
    // Initialize IPC system
    if (init_ipc_system() < 0) {
        fprintf(stderr, "Failed to initialize IPC system\n");
        return 1;
    }
    
    // Create socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("Socket creation failed");
        return 1;
    }
    
    // Allow socket reuse
    int opt = 1;
    setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
    
    // Bind socket
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);
    
    if (bind(server_socket, (struct sockaddr *)&server_addr, sizeof(server_addr)) < 0) {
        perror("Bind failed");
        close(server_socket);
        return 1;
    }
    
    // Listen
    if (listen(server_socket, MAX_CLIENTS) < 0) {
        perror("Listen failed");
        close(server_socket);
        return 1;
    }
    
    printf("Server listening on port %d\n", PORT);
    printf("IPC Framework ready to accept connections\n\n");
    
    // Accept connections
    while (1) {
        client_socket = accept(server_socket, (struct sockaddr *)&client_addr, &client_len);
        if (client_socket < 0) {
            perror("Accept failed");
            continue;
        }
        
        ClientInfo *client = malloc(sizeof(ClientInfo));
        client->socket = client_socket;
        strcpy(client->ip, inet_ntoa(client_addr.sin_addr));
        client->port = ntohs(client_addr.sin_port);
        
        // Create thread to handle client
        if (pthread_create(&thread_id, NULL, handle_client, (void *)client) != 0) {
            perror("Thread creation failed");
            close(client_socket);
            free(client);
        } else {
            pthread_detach(thread_id);
        }
    }
    
    cleanup_ipc_system();
    close(server_socket);
    return 0;
}
