#!/bin/bash


# Function to start monitoring
start_monitoring() {
    echo "Starting container monitoring..."
    docker-compose up -d
    echo "Sample NGINX container is running."
    echo "Access NGINX at http://localhost:8081"
    echo "========================================"
    echo "Monitoring services are now running."
    echo "Access cAdvisor at http://localhost:8080"
    echo "Access Prometheus at http://localhost:9090"
    echo "Access a react based dashboard at http://localhost:3000"
}

# Function to stop monitoring
stop_monitoring() {
    echo "Stopping monitoring services..."
    docker-compose down
}

# Function to view container logs
view_logs() {
    local container_name=$1
    if [ -z "$container_name" ]; then
        echo "Please specify a container name"
        exit 1
    fi
    docker logs "$container_name"
}

# Function to stream live container logs
stream_logs() {
    local container_name=$1
    if [ -z "$container_name" ]; then
        echo "Please specify a container name"
        exit 1
    fi
    docker logs -f "$container_name"
}

# Function to query Prometheus
prometheus_query() {
    local query=$1
    curl -g "http://localhost:9090/api/v1/query?query=${query}"
}

# Main script logic
case "$1" in
    start)
        start_monitoring
        ;;
    stop)
        stop_monitoring
        ;;
    logs)
        view_logs "$2"
        ;;
    stream)
        stream_logs "$2"
        ;;
    query)
        prometheus_query "$2"
        ;;
    *)
        echo "Usage: $0 {start|stop|logs <container_name>|stream <container_name>|query <query>}"
        exit 1
esac

exit 0