_GREEN          = \033[0;32m
_END            = \033[m
_BOLD           = \x1b[1m
_BLUE           = \033[36m
_INFO           = ${_BLUE}${_BOLD}
_INFO_LIGHT     = ${_BLUE}
_SUCCESS        = ${_GREEN}${_BOLD}
_SUCCESS_LIGHT  = ${_GREEN}

CARGO_BUILD_WASI = cargo build --target=wasm32-wasi --release
NODE_RUN_WASI = node --experimental-wasi-unstable-preview1 --experimental-wasm-bigint
WASI_SDK_BUILD = /wasi-sdk/bin/clang --sysroot=/wasi-sdk/share/wasi-sysroot

DOCKER_TOOLCHAIN_IMAGE_NAME = topheman/webassembly-wasi-experiments-toolchain
DOCKER_TOOLCHAIN_IMAGE_VERSION = 0.0.1
DOCKER_PYTHON_IMAGE_NAME = topheman/webassembly-wasi-experiments-python
DOCKER_PYTHON_IMAGE_VERSION = 0.0.1
DOCKER_WASISDK_IMAGE_NAME = topheman/webassembly-wasi-experiments-wasi-sdk
DOCKER_WASISDK_IMAGE_VERSION = 0.0.1

docker_run_toolchain = \
	docker run --rm -v $(shell pwd)$1 $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION) $2

docker_run_python = \
	docker run --rm -v $(shell pwd)$1 $(DOCKER_PYTHON_IMAGE_NAME):$(DOCKER_PYTHON_IMAGE_VERSION) $2

docker_run_wasi_sdk = \
	docker run --rm -v $(shell pwd)$1 $(DOCKER_WASISDK_IMAGE_NAME):$(DOCKER_WASISDK_IMAGE_VERSION) $2

# Checking for cat if not present to avoid failing the whole command
output_tmp_txt = \
	command -v cat > /dev/null && echo "${_INFO_LIGHT}Generated $1/tmp.txt${_END} 👇" && cat $1/tmp.txt

default: help

.PHONY: cleanup docker-run-python-c-app docker-run-python-rust-app docker-run-rust-app docker-run-wasmtime-c-app docker-run-wasmtime-rust-app docker-wasm-create-c-app docker-wasm-create-rust-app init-docker run-c-app run-node-c-app run-node-rust-app run-rust-app run-wasmtime-c-app run-wasmtime-rust-app wasm-create-rust-app

init-docker: ## 🛠    Build docker images 🐳
	$(MAKE) init-docker-toolchain
	$(MAKE) init-docker-python
	$(MAKE) init-docker-wasi-sdk

init-docker-toolchain:
	docker build - < toolchain.Dockerfile -t $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION)

init-docker-python:
	docker build - < python.Dockerfile -t $(DOCKER_PYTHON_IMAGE_NAME):$(DOCKER_PYTHON_IMAGE_VERSION)

init-docker-wasi-sdk:
	docker build - < wasi-sdk.Dockerfile -t $(DOCKER_WASISDK_IMAGE_NAME):$(DOCKER_WASISDK_IMAGE_VERSION)

run-rust-app: ## 🦀▶️  [rust-app][rust ] Run rust-app (on host) 💻
	cd rust-app && cargo run "$(shell date)" "Running from cargo on Host"
	@$(call output_tmp_txt,./rust-app)

run-c-app: ## 🅲▶️   [c-app   ][c    ] Run c-app (on host) 💻
	$(MAKE) build-c-app && cd c && ./c-app "$(shell date)" "Running from c-app (on host) compiled with gcc (on host)"
	@$(call output_tmp_txt,./c)

docker-run-rust-app: ## 🦀▶️  [rust-app][rust ] Run rust-app (via docker) 🐳
	$(call docker_run_toolchain,/rust-app:/code,cargo run "$(shell date)" "Running from cargo on Docker")
	@$(call output_tmp_txt,./rust-app)

wasm-build-rust-app:
	cd rust-app && $(CARGO_BUILD_WASI)

build-c-app:
	gcc ./c/c-app.c -o ./c/c-app

docker-wasm-build-c-app:
	@echo "${_INFO}Compiling ./c/c-app.c with clang (and wasi-sdk setup) from docker${_END}"
	$(call docker_run_wasi_sdk,/c:/code,$(WASI_SDK_BUILD) /code/c-app.c -o /code/c-app-generated.wasm)

docker-wasm-build-rust-app:
	@echo "${_INFO}Compiling ./rust-app with cargo from docker${_END}"
	$(call docker_run_toolchain,/rust-app:/code,$(CARGO_BUILD_WASI))

cpwasm-c-app:
	@echo "${_INFO}Copying generated .wasm file to node, python, browser folders${_END}"
	cp c/c-app-generated.wasm node/
	cp c/c-app-generated.wasm python/
	cp c/c-app-generated.wasm browser/

cpwasm-rust-app:
	@echo "${_INFO}Copying generated .wasm file to node, python, browser folders${_END}"
	cp rust-app/target/wasm32-wasi/release/rust-app.wasm node/
	cp rust-app/target/wasm32-wasi/release/rust-app.wasm python/
	cp rust-app/target/wasm32-wasi/release/rust-app.wasm browser/

wasm-create-rust-app: ## 🦀⚙️  [rust-app][build] Build wasm file + copy to node/wasm (on host) 💻
	$(MAKE) wasm-build-rust-app
	$(MAKE) cpwasm-rust-app

docker-wasm-create-c-app: ## 🅲⚙️   [c-app   ][build] Build wasm file + copy to node/wasm (via docker) 🐳
	$(MAKE) docker-wasm-build-c-app
	$(MAKE) cpwasm-c-app
	@echo "${_INFO}Now, you can run the following:\n  - make docker-run-wasmtime-c-app\n  - make docker-run-python-c-app\n  - make run-node-c-app${_END}"

docker-wasm-create-rust-app: ## 🦀⚙️  [rust-app][build] Build wasm file + copy to node/wasm (via docker) 🐳
	$(MAKE) docker-wasm-build-rust-app
	$(MAKE) cpwasm-rust-app
	@echo "${_INFO}Now, you can run the following:\n  - make docker-run-wasmtime-rust-app\n  - make docker-run-python-rust-app\n  - make run-node-rust-app${_END}"

run-wasmtime-c-app: ## 🟦▶️  [c-app   ][wasm ] Run through wasmtime (on host) 💻
	wasmtime ./c/c-app-generated.wasm --dir=. --mapdir=.::$(shell pwd)/c "$(shell date)" "Running from wasmtime on Host" "Original program: C compiled with clang to WASM" "Accessing File System from within WebAssembly thx to WASI"
	@$(call output_tmp_txt,./c)

run-wasmtime-rust-app: ## 🟦▶️  [rust-app][wasm ] Run through wasmtime (on host) 💻
	wasmtime ./rust-app/target/wasm32-wasi/release/rust-app.wasm --dir=. --mapdir=.::$(shell pwd)/rust-app "$(shell date)" "Running from wasmtime on Host" "Original program: Rust compiled with cargo to WASM" "Accessing File System from within WebAssembly thx to WASI"
	@$(call output_tmp_txt,./rust-app)

docker-run-wasmtime-c-app: ## 🟦▶️  [c-app   ][wasm ] Run through wasmtime (via docker) 🐳
	$(call docker_run_toolchain,/c:/code,wasmtime ./c-app-generated.wasm --dir=. --mapdir=.::/code) "$(shell date)" "Running from wasmtime on Docker" "Original program: C compiled with clang to WASM" "Accessing File System from within WebAssembly thx to WASI"
	@$(call output_tmp_txt,./c)

docker-run-wasmtime-rust-app: ## 🟦▶️  [rust-app][wasm ] Run through wasmtime (via docker) 🐳
	$(call docker_run_toolchain,/rust-app:/code,wasmtime ./target/wasm32-wasi/release/rust-app.wasm --dir=. --mapdir=.::/code) "$(shell date)" "Running from wasmtime on Docker" "Original program: Rust compiled with cargo to WASM" "Accessing File System from within WebAssembly thx to WASI"
	@$(call output_tmp_txt,./rust-app)

run-node-c-app: ## 🟨▶️  [c-app   ][wasm ] Run through WASI in nodeJS (on host) 💻
	$(NODE_RUN_WASI) ./node/c-app.js "$(shell date)" "Running from node on Host" "Original program: C compiled with clang to WASM" "Accessing File System from within WebAssembly thx to WASI"
	@$(call output_tmp_txt,./node)

run-node-rust-app: ## 🟨▶️  [rust-app][wasm ] Run through WASI in nodeJS (on host) 💻
	$(NODE_RUN_WASI) ./node/rust-app.js "$(shell date)" "Running from node on Host" "Original program: Rust compiled with cargo to WASM" "Accessing File System from within WebAssembly thx to WASI"
	@$(call output_tmp_txt,./node)

docker-run-python-c-app: ## 🐍▶️  [c-app   ][wasm ] Run through WASI in python - using wasmer runtime (on docker) 🐳
	$(call docker_run_python,/python:/code,python3 c-app.py "$(shell date)" "Running from python (wasmer) on Docker" "Original program: C compiled with clang to WASM" "Accessing File System from within WebAssembly thx to WASI")
	@$(call output_tmp_txt,./python)

docker-run-python-rust-app: ## 🐍▶️  [rust-app][wasm ] Run through WASI in python - using wasmer runtime (on docker) 🐳
	$(call docker_run_python,/python:/code,python3 rust-app.py "$(shell date)" "Running from python (wasmer) on Docker" "Original program: Rust compiled with cargo to WASM" "Accessing File System from within WebAssembly thx to WASI")
	@$(call output_tmp_txt,./python)

docker-run-toolchain-bash:
	docker run -it --rm $(DOCKER_TOOLCHAIN_IMAGE_NAME):$(DOCKER_TOOLCHAIN_IMAGE_VERSION) bash

docker-run-wasi-sdk-bash:
	docker run -it --rm $(DOCKER_WASISDK_IMAGE_NAME):$(DOCKER_WASISDK_IMAGE_VERSION) bash

cleanup: ## 🛠    Cleanup tmp.txt files 🗑
	find . -name tmp.txt -delete

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Start with one of the following commands (more infos after) 👇"
	@echo "  - ${_BOLD}make docker-wasm-create-rust-app${_END}"
	@echo "  - ${_BOLD}make docker-wasm-create-c-app${_END}"
	@echo ""
	@echo "More infos at https://github.com/topheman/webassembly-wasi-experiments#run"

list-phony:
	# List all the tasks to add the to .PHONY (choose between inlined and linefeed)
	# bash variables are expanded with $$
	# make|sed 's/\|/ /'|awk '{printf "%s+ ", $1}'
	# make|sed 's/\|/ /'|awk '{print $1}'
	@$(MAKE) help|sed 's/\|/ /'|awk '{printf "%s ", $$1}'
	@echo "\n"
	@$(MAKE) help|sed 's/\|/ /'|awk '{print $$1}'
