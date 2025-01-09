#!/bin/bash

# Elasticsearch server details
ES_URL="http://localhost:9200"

# Check cluster health
STATUS=$(curl -s -X GET "$ES_URL/_cluster/health" | jq -r .status)

# Restart Elasticsearch if the status is red
if [ "$STATUS" == "red" ]; then
    echo "Cluster health is red. Restarting Elasticsearch..."
    sudo systemctl restart elasticsearch

    # Verify cluster health after restart
    sleep 10
    NEW_STATUS=$(curl -s -X GET "$ES_URL/_cluster/health" | jq -r .status)
    echo "Cluster health after restart: $NEW_STATUS"
else
    echo "Cluster health is $STATUS. No restart needed."
fi
