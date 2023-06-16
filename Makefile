SHELL := /bin/bash

test: load_env
	forge test --fork-url $(FORK_URL)

compile:
	forge compile

fmt:
	forge fmt

load_env:
	source .envs