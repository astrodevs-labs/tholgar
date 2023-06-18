SHELL := /bin/bash

test:
	source .env; \
	forge test --fork-url $${FORK_URL}

coverage:
	source .env; \
	forge coverage --fork-url $${FORK_URL}

gas-report:
	source .env; \
	forge test --fork-url $${FORK_URL} --gas-report

compile:
	forge compile

fmt:
	forge fmt

.PHONY: test compile fmt gas-report coverage