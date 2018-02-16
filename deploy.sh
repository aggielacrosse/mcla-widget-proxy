STACK_NAME="mcla-widget-$STAGE"

./node_modules/.bin/sls deploy --stage $STAGE

BUCKET_NAME=$(aws cloudformation describe-stack-resources --stack-name $STACK_NAME --query 'StackResources[?LogicalResourceId==`ImageBucket`].PhysicalResourceId' --output text)

aws s3 sync content/img "s3://$BUCKET_NAME"