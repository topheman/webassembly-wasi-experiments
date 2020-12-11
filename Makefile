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

# Checking for cat if not present to avoid failing the whole command
output_tmp_txt = \
	command -v cat > /dev/null && echo "Generated tmp.txt 👇" && cat $1/tmp.txt

default: help

.PHONY: cleanup create-rust-app build-rust-app cpwasm-rust-app run-wasmtime-rust-app run-node-rust-app

init-docker: ## 🛠  Build docker images 🐳
	docker build - < toolchain.Dockerfile -t $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION)

run-rust-app: ## 🦀▶️  [rust-app] Run rust-app (on host) 💻
	cd rust-app && cargo run "$(shell date)" "Running from cargo on Host" && $(call output_tmp_txt,.)

docker-run-rust-app: ## 🦀▶️  [rust-app] Run rust-app (on host) 🐳
	$(call docker_run_toolchain,/rust-app:/code,cargo run "$(shell date)" "Running from cargo on Docker") && $(call output_tmp_txt,./rust-app)

build-rust-app:
	cd rust-app && $(CARGO_BUILD_WASI)

docker-build-rust-app:
	$(call docker_run_toolchain,/rust-app:/code,$(CARGO_BUILD_WASI))

cpwasm-rust-app:
	cp rust-app/target/wasm32-wasi/release/rust-app.wasm node/

create-rust-app: ## 🦀⚙️  [rust-app] Build wasm file + copy to node/wasm (on host) 💻
	$(MAKE) build-rust-app
	$(MAKE) cpwasm-rust-app

docker-create-rust-app: ## 🦀⚙️  [rust-app] Build wasm file + copy to node/wasm (via docker) 🐳
	$(MAKE) docker-build-rust-app
	$(MAKE) cpwasm-rust-app

run-wasmtime-rust-app: ## 🟦▶️  [rust-app] Run through wasmtime (on host) 💻
	wasmtime ./rust-app/target/wasm32-wasi/release/rust-app.wasm --dir=. --mapdir=.::$(shell pwd)/rust-app

docker-run-wasmtime-rust-app: ## 🟦▶️  [rust-app] Run through wasmtime (via docker) 🐳
	$(call docker_run_toolchain,/rust-app:/code,wasmtime ./target/wasm32-wasi/release/rust-app.wasm --dir=. --mapdir=.::/code)

run-node-rust-app: ## 🟨▶️  [rust-app] Run through WASI in nodeJS (on host) 💻
	$(NODE_RUN_WASI) ./node/rust-app.js

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
