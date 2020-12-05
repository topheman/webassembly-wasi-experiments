OK_COLOR     = \033[0;32m
NO_COLOR     = \033[m

CARGO_BUILD_WASI = cargo build --target=wasm32-wasi --release

default: help

.PHONY: create-rust-write-file build-rust-write-file cpwasm-rust-write-file

build-rust-write-file:
	cd rust-write-file && $(CARGO_BUILD_WASI)

cpwasm-rust-write-file:
	cp rust-write-file/target/wasm32-wasi/release/rust-write-file.wasm node/wasm/

create-rust-write-file: ## Build wasm file + copy to node/wasm
	$(MAKE) build-rust-write-file
	$(MAKE) cpwasm-rust-write-file

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

list-phony:
	# List all the tasks to add the to .PHONY (choose between inlined and linefeed)
	# bash variables are expanded with $$
	# make|sed 's/\|/ /'|awk '{printf "%s+ ", $1}'
	# make|sed 's/\|/ /'|awk '{print $1}'
	@$(MAKE) help|sed 's/\|/ /'|awk '{printf "%s ", $$1}'
	@echo "\n"
	@$(MAKE) help|sed 's/\|/ /'|awk '{print $$1}'
