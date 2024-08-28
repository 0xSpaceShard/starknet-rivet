#!/usr/bin/env bash

docker_args=""

install_docker() {
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        
        # Install Docker
        sudo apt-get update
        sudo apt-get install -y docker.io

        # Start Docker service
        sudo systemctl start docker

        echo "Docker has been installed and started."
    fi
}

start_starknet_container() {
    echo "Starting Starknet container..."

    docker pull shardlabs/starknet-devnet-rs:latest
    docker run -p 127.0.0.1:5050:5050 shardlabs/starknet-devnet-rs:latest $docker_args
}

while [[ -n $1 ]]; do
    case $1 in
      --)             shift; break;;
      --no-l1)        shift; no_l1=true;;
	  --args)         shift; docker_args+=$1;;
    esac; shift
done

install_docker

if [ "$no_l1" != true ]; then
    curl -L https://foundry.paradigm.xyz | bash
    foundryup    
fi

start_starknet_container
