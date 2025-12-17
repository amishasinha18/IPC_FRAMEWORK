#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/ipc.h>
#include <sys/msg.h>
#include <sys/shm.h>
#include <pthread.h>
#include <time.h>
#include <openssl/aes.h>
#include <openssl/rand.h>
#include <openssl/sha.h>

#define MAX_PIPE_SIZE 4096
#define MAX_MSG_SIZE 2048
#define SHM_SIZE 8192
#define MAX_CLIENTS 10
#define AUTH_TOKEN_SIZE 32

// Security structure
typedef struct {
    char token[AUTH_TOKEN_SIZE];
    char username[64];
    int authenticated;
    time_t created_at;
} SecurityToken;

// Message structure for message queue
typedef struct {
    long msg_type;
    char sender[64];
    char receiver[64];
    char data[MAX_MSG_SIZE];
    int encrypted;
    time_t timestamp;
} IPCMessage;

// Shared memory structure
typedef struct {
    int active_connections;
    int total_messages;
    int pipe_count;
    int queue_count;
    int shm_segments;
    char status[256];
    SecurityToken tokens[MAX_CLIENTS];
} SharedMemoryData;

// Pipe data structure
typedef struct {
    int pipe_fd[2];
    char name[64];
    int active;
    long bytes_transferred;
} PipeInfo;

// Global variables
static SharedMemoryData *shm_data = NULL;
static int shm_id = -1;
static int msg_queue_id = -1;
static PipeInfo pipes[MAX_CLIENTS];
static pthread_mutex_t security_mutex = PTHREAD_MUTEX_INITIALIZER;

// Security functions
int generate_token(char *token) {
    if (RAND_bytes((unsigned char *)token, AUTH_TOKEN_SIZE) != 1) {
        return -1;
    }
    return 0;
}

int hash_password(const char *password, char *hash_out) {
    unsigned char hash[SHA256_DIGEST_LENGTH];
    SHA256((unsigned char *)password, strlen(password), hash);
    
    for (int i = 0; i < SHA256_DIGEST_LENGTH; i++) {
        sprintf(hash_out + (i * 2), "%02x", hash[i]);
    }
    hash_out[SHA256_DIGEST_LENGTH * 2] = 0;
    return 0;
}

int authenticate_user(const char *username, const char *password, char *token_out) {
    pthread_mutex_lock(&security_mutex);
    
    // Simple authentication (in production, check against database)
    char expected_hash[SHA256_DIGEST_LENGTH * 2 + 1];
    hash_password(password, expected_hash);
    
    // Find available token slot
    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (!shm_data->tokens[i].authenticated) {
            generate_token(shm_data->tokens[i].token);
            strncpy(shm_data->tokens[i].username, username, 63);
            shm_data->tokens[i].authenticated = 1;
            shm_data->tokens[i].created_at = time(NULL);
            memcpy(token_out, shm_data->tokens[i].token, AUTH_TOKEN_SIZE);
            
            pthread_mutex_unlock(&security_mutex);
            return i;
        }
    }
    
    pthread_mutex_unlock(&security_mutex);
    return -1;
}

int verify_token(const char *token) {
    pthread_mutex_lock(&security_mutex);
    
    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (shm_data->tokens[i].authenticated &&
            memcmp(shm_data->tokens[i].token, token, AUTH_TOKEN_SIZE) == 0) {
            
            // Check if token expired (24 hour expiry)
            time_t now = time(NULL);
            if (now - shm_data->tokens[i].created_at > 86400) {
                shm_data->tokens[i].authenticated = 0;
                pthread_mutex_unlock(&security_mutex);
                return -1;
            }
            
            pthread_mutex_unlock(&security_mutex);
            return i;
        }
    }
    
    pthread_mutex_unlock(&security_mutex);
    return -1;
}

// IPC Core functions
int init_ipc_system() {
    // Create shared memory
    key_t shm_key = ftok("/tmp", 'S');
    shm_id = shmget(shm_key, sizeof(SharedMemoryData), IPC_CREAT | 0666);
    if (shm_id < 0) {
        perror("Failed to create shared memory");
        return -1;
    }
    
    shm_data = (SharedMemoryData *)shmat(shm_id, NULL, 0);
    if (shm_data == (void *)-1) {
        perror("Failed to attach shared memory");
        return -1;
    }
    
    // Initialize shared memory
    memset(shm_data, 0, sizeof(SharedMemoryData));
    shm_data->active_connections = 0;
    shm_data->total_messages = 0;
    shm_data->pipe_count = 0;
    shm_data->queue_count = 0;
    shm_data->shm_segments = 1;
    strcpy(shm_data->status, "IPC System Initialized");
    
    // Create message queue
    key_t msg_key = ftok("/tmp", 'M');
    msg_queue_id = msgget(msg_key, IPC_CREAT | 0666);
    if (msg_queue_id < 0) {
        perror("Failed to create message queue");
        return -1;
    }
    
    // Initialize pipes
    for (int i = 0; i < MAX_CLIENTS; i++) {
        pipes[i].active = 0;
        pipes[i].bytes_transferred = 0;
    }
    
    printf("IPC System initialized successfully\n");
    printf("Shared Memory ID: %d\n", shm_id);
    printf("Message Queue ID: %d\n", msg_queue_id);
    
    return 0;
}

int create_pipe_channel(const char *name) {
    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (!pipes[i].active) {
            if (pipe(pipes[i].pipe_fd) < 0) {
                perror("Failed to create pipe");
                return -1;
            }
            
            strncpy(pipes[i].name, name, 63);
            pipes[i].active = 1;
            pipes[i].bytes_transferred = 0;
            shm_data->pipe_count++;
            
            printf("Pipe created: %s (fd: %d -> %d)\n", 
                   name, pipes[i].pipe_fd[0], pipes[i].pipe_fd[1]);
            return i;
        }
    }
    return -1;
}

int send_pipe_data(int pipe_id, const char *data, int size) {
    if (pipe_id < 0 || pipe_id >= MAX_CLIENTS || !pipes[pipe_id].active) {
        return -1;
    }
    
    int written = write(pipes[pipe_id].pipe_fd[1], data, size);
    if (written > 0) {
        pipes[pipe_id].bytes_transferred += written;
        shm_data->total_messages++;
    }
    
    return written;
}

int receive_pipe_data(int pipe_id, char *buffer, int size) {
    if (pipe_id < 0 || pipe_id >= MAX_CLIENTS || !pipes[pipe_id].active) {
        return -1;
    }
    
    return read(pipes[pipe_id].pipe_fd[0], buffer, size);
}

int send_message_queue(const char *sender, const char *receiver, 
                       const char *data, long msg_type) {
    IPCMessage msg;
    msg.msg_type = msg_type;
    strncpy(msg.sender, sender, 63);
    strncpy(msg.receiver, receiver, 63);
    strncpy(msg.data, data, MAX_MSG_SIZE - 1);
    msg.encrypted = 0;
    msg.timestamp = time(NULL);
    
    if (msgsnd(msg_queue_id, &msg, sizeof(IPCMessage) - sizeof(long), 0) < 0) {
        perror("Failed to send message");
        return -1;
    }
    
    shm_data->total_messages++;
    shm_data->queue_count++;
    
    return 0;
}

int receive_message_queue(IPCMessage *msg, long msg_type) {
    if (msgrcv(msg_queue_id, msg, sizeof(IPCMessage) - sizeof(long), 
               msg_type, IPC_NOWAIT) < 0) {
        return -1;
    }
    
    return 0;
}

void get_system_stats(char *stats_json, int max_size) {
    snprintf(stats_json, max_size,
             "{\"active_connections\":%d,"
             "\"total_messages\":%d,"
             "\"pipe_count\":%d,"
             "\"queue_count\":%d,"
             "\"shm_segments\":%d,"
             "\"status\":\"%s\","
             "\"timestamp\":%ld}",
             shm_data->active_connections,
             shm_data->total_messages,
             shm_data->pipe_count,
             shm_data->queue_count,
             shm_data->shm_segments,
             shm_data->status,
             time(NULL));
}

void cleanup_ipc_system() {
    // Close all pipes
    for (int i = 0; i < MAX_CLIENTS; i++) {
        if (pipes[i].active) {
            close(pipes[i].pipe_fd[0]);
            close(pipes[i].pipe_fd[1]);
        }
    }
    
    // Detach and remove shared memory
    if (shm_data) {
        shmdt(shm_data);
        shmctl(shm_id, IPC_RMID, NULL);
    }
    
    // Remove message queue
    if (msg_queue_id >= 0) {
        msgctl(msg_queue_id, IPC_RMID, NULL);
    }
    
    printf("IPC System cleaned up\n");
}

// Main function for testing
int main() {
    printf("=== IPC Framework Core ===\n\n");
    
    if (init_ipc_system() < 0) {
        fprintf(stderr, "Failed to initialize IPC system\n");
        return 1;
    }
    
    // Test authentication
    char token[AUTH_TOKEN_SIZE];
    int auth_id = authenticate_user("admin", "password123", token);
    if (auth_id >= 0) {
        printf("\nAuthentication successful! Token ID: %d\n", auth_id);
    }
    
    // Test pipe communication
    int pipe_id = create_pipe_channel("test_pipe");
    if (pipe_id >= 0) {
        const char *test_msg = "Hello via pipe!";
        send_pipe_data(pipe_id, test_msg, strlen(test_msg) + 1);
        
        char buffer[256];
        int received = receive_pipe_data(pipe_id, buffer, sizeof(buffer));
        if (received > 0) {
            printf("Pipe test: Sent and received '%s'\n", buffer);
        }
    }
    
    // Test message queue
    send_message_queue("process_1", "process_2", "Hello from message queue!", 1);
    
    IPCMessage msg;
    if (receive_message_queue(&msg, 1) == 0) {
        printf("Message queue test: From %s to %s: %s\n", 
               msg.sender, msg.receiver, msg.data);
    }
    
    // Display stats
    char stats[1024];
    get_system_stats(stats, sizeof(stats));
    printf("\nSystem Stats:\n%s\n", stats);
    
    printf("\nIPC System running. Press Ctrl+C to stop...\n");
    
    // Keep running
    while (1) {
        sleep(5);
        get_system_stats(stats, sizeof(stats));
        printf("\n[%ld] Stats: %s\n", time(NULL), stats);
    }
    
    cleanup_ipc_system();
    return 0;
}
