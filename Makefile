CONTAINER_NAME = dynaflow-testing-dynamo
BIND_PORT = 8000

.PHONY: test
test:
	npm test

.PHONY: test-docker
test-docker: docker-dynamo-start test docker-dynamo-stop

.PHONY: docker-dynamo-start
docker-dynamo-start:
	if ! ( docker ps | grep -q $(CONTAINER_NAME)) ; then \
	docker run --rm --name $(CONTAINER_NAME) -p $(BIND_PORT):8000 -d cnadiminti/dynamodb-local:2017-04-22_beta; \
	fi;

.PHONY: docker-dynamo-stop
docker-dynamo-stop:
	if docker ps | grep -q $(CONTAINER_NAME); then \
	docker stop $(CONTAINER_NAME); \
	fi;
