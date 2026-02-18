#!/bin/bash
# Quick test of Replicate video generation

REPLICATE_API_TOKEN="YOUR_REPLICATE_TOKEN"
IMAGE_PATH="output/test-hawaii.jpg"

# Convert image to base64
IMAGE_BASE64=$(base64 -w 0 "$IMAGE_PATH")
DATA_URI="data:image/jpeg;base64,$IMAGE_BASE64"

echo "🎬 Submitting to Stable Video Diffusion..."

# Create prediction
RESPONSE=$(curl -s -X POST "https://api.replicate.com/v1/predictions" \
  -H "Authorization: Token $REPLICATE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"version\": \"3f0457e4619daac51203dedb472816fd4af51f3149fa7a9e0b5ffcf1b8172438\",
    \"input\": {
      \"input_image\": \"$DATA_URI\",
      \"motion_bucket_id\": 40,
      \"fps\": 8,
      \"cond_aug\": 0.02,
      \"decoding_t\": 7,
      \"seed\": 42
    }
  }")

echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('ID:', d.get('id')); print('Status:', d.get('status'))"

PRED_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('id',''))")

echo "Prediction ID: $PRED_ID"
echo ""
echo "Polling for completion..."

# Poll for result
while true; do
  RESULT=$(curl -s "https://api.replicate.com/v1/predictions/$PRED_ID" \
    -H "Authorization: Token $REPLICATE_API_TOKEN")
  
  STATUS=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status',''))")
  echo "  Status: $STATUS"
  
  if [ "$STATUS" = "succeeded" ]; then
    OUTPUT=$(echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('output',''))")
    echo "✅ Done!"
    echo "Video URL: $OUTPUT"
    
    # Download video
    echo "Downloading..."
    curl -sL "$OUTPUT" -o output/test-motion.mp4
    echo "Saved to: output/test-motion.mp4"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "❌ Failed!"
    echo "$RESULT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))"
    break
  fi
  
  sleep 5
done
