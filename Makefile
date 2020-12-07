OK_COLOR     = \033[0;32m
NO_COLOR     = \033[m

CARGO_BUILD_WASI = cargo build --target=wasm32-wasi --release
NODE_RUN_WASI = node --experimental-wasi-unstable-preview1 --experimental-wasm-bigint

DOCKER_TOOLCHAIN_IMAGE_NAME = topheman/webassembly-wasi-experiments-toolchain
DOCKER_TOOLCHAIN_IMAGE_VERSION = 0.0.1

docker_run_toolchain = \
	docker run --rm -v $(shell pwd)$1 $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION) $2

docker_run_toolchain_no_volumes = \
 docker run --rm $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION) $1

default: help

.PHONY: cleanup create-rust-write-file build-rust-write-file cpwasm-rust-write-file run-wasmtime-rust-write-file run-node-rust-write-file

init-docker: ## 🛠  Build docker images 🐳
	docker build - < toolchain.Dockerfile -t $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION)

build-rust-write-file:
	cd rust-write-file && $(CARGO_BUILD_WASI)

docker-build-rust-write-file:
	$(call docker_run_toolchain,/rust-write-file:/code,$(CARGO_BUILD_WASI))

cpwasm-rust-write-file:
	cp rust-write-file/target/wasm32-wasi/release/rust-write-file.wasm node/

create-rust-write-file: ## 🦀⚙️  [rust-write-file] Build wasm file + copy to node/wasm (on host) 💻
	$(MAKE) build-rust-write-file
	$(MAKE) cpwasm-rust-write-file

docker-create-rust-write-file: ## 🦀⚙️  [rust-write-file] Build wasm file + copy to node/wasm (via docker) 🐳
	$(MAKE) docker-build-rust-write-file
	$(MAKE) cpwasm-rust-write-file

run-wasmtime-rust-write-file: ## 🟦▶️  [rust-write-file] Run through wasmtime (on host) 💻
	wasmtime ./rust-write-file/target/wasm32-wasi/release/rust-write-file.wasm --dir=./

docker-run-wasmtime-rust-write-file: ## 🟦▶️  [rust-write-file] Run through wasmtime (via docker) 🐳
	$(call docker_run_toolchain,/rust-write-file:/code,wasmtime ./target/wasm32-wasi/release/rust-write-file.wasm --dir=./)

run-node-rust-write-file: ## 🟨▶️  [rust-write-file] Run through WASI in nodeJS (on host) 💻
	$(NODE_RUN_WASI) ./node/rust-write-file.js

docker-run-toolchain-bash:
	docker run -it --rm $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION) bash

cleanup: ## 🛠  Cleanup tmp.txt files 🗑
	find . -name tmp.txt -delete

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}'

list-phony:
	# List all the tasks to add the to .PHONY (choose between inlined and linefeed)
	# bash variables are expanded with $$
	# make|sed 's/\|/ /'|awk '{printf "%s+ ", $1}'
	# make|sed 's/\|/ /'|awk '{print $1}'
	@$(MAKE) help|sed 's/\|/ /'|awk '{printf "%s ", $$1}'
	@echo "\n"
	@$(MAKE) help|sed 's/\|/ /'|awk '{print $$1}'
