SHELL := /bin/bash

test:
	source .env; \
	forge test --fork-url $${FORK_URL}

compile:
	forge compile

fmt:
	forge fmt

.PHONY: test compile fmt