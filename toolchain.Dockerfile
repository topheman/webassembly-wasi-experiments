FROM rust:1.48.0-slim-buster

# rust/wasi
RUN rustup target add wasm32-wasi

# wasmtime
RUN apt-get -y update
RUN apt-get -y install curl xz-utils

RUN curl https://wasmtime.dev/install.sh -sSf | bash

# Adding wasmtime to the path doesn't work when passing "wasmtime" as a command to docker-run
# RUN sed -i 's/PATH="/PATH="\/root\/.wasmtime\/bin:/g' /etc/profile

# Solution: copy it to a location already in the path
RUN cp /root/.wasmtime/bin/wasmtime /usr/local/bin/wasmtime
RUN apt-get -y clean

# final
RUN mkdir code

WORKDIR /code
