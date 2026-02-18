#!/bin/bash
# Run SAM2 segmentation on all panoramas

TOKEN="YOUR_TOKEN"
LOCATIONS=("hilo-bayfront" "punaluu-beach" "keaau")

for LOC in "${LOCATIONS[@]}"; do
    echo "Processing: $LOC"
    
    # Submit to SAM2
    RESPONSE=$(curl -s -X POST "https://api.replicate.com/v1/predictions" \
      -H "Authorization: Token $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"version\": \"fe97b453a6455861e3bac769b441ca1f1086110da7466dbb65cf1eecfd60dc83\",
        \"input\": {
          \"image\": \"https://raw.githubusercontent.com/claytondb/bigislandvr-3/main/ai-motion/panoramas/${LOC}.jpg\",
          \"points_per_side\": 16,
          \"pred_iou_thresh\": 0.86,
          \"stability_score_thresh\": 0.92
        }
      }")
    
    PRED_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")
    echo "  Prediction ID: $PRED_ID"
    
    # Wait for completion
    for i in {1..30}; do
        sleep 3
        RESULT=$(curl -s "https://api.replicate.com/v1/predictions/$PRED_ID" -H "Authorization: Token $TOKEN")
        STATUS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
        
        if [ "$STATUS" = "succeeded" ]; then
            echo "  Completed!"
            echo "$RESULT" > "${LOC}-sam2-result.json"
            break
        elif [ "$STATUS" = "failed" ]; then
            echo "  Failed!"
            break
        fi
        echo "  Status: $STATUS..."
    done
    
    sleep 5  # Rate limit
done

echo "Done!"
