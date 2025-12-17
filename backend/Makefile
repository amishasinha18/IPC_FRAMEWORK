CC = gcc
CFLAGS = -Wall -pthread -g
LDFLAGS = -lssl -lcrypto

all: ipc_core ipc_server

ipc_core: ipc_core.c
	$(CC) $(CFLAGS) -o ipc_core ipc_core.c $(LDFLAGS)

ipc_server: ipc_core.c ipc_server.c
	$(CC) $(CFLAGS) -o ipc_server ipc_core.c ipc_server.c $(LDFLAGS)

clean:
	rm -f ipc_core ipc_server
	ipcrm -a 2>/dev/null || true

run_core: ipc_core
	./ipc_core

run_server: ipc_server
	./ipc_server

.PHONY: all clean run_core run_server
