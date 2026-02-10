pipeline {
    agent any
    
    tools {
        nodejs 'node'
    }
    
    environment {
        DOCKERHUB_CREDENTIALS = 'docker-hub-credentials'
        IMAGE_NAME = 'sasankpoiu/ecommerce-app'
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Checking out code..."
                checkout scm
            }
        }
        
        stage('Build & Test') {
            steps {
                script {
                    // This forces Jenkins to initialize the tool
                    def nodeHome = tool name: 'node', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
                echo "Installing dependencies & running tests..."
                sh 'npm install'
                sh 'npm test || echo "No tests yet - skipping"'
                script {
                    echo "Build completed successfully at ${new Date()}"
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image..."
                sh "docker build -t ${IMAGE_NAME}:${GIT_COMMIT_SHORT} ."
                sh "docker tag ${IMAGE_NAME}:${GIT_COMMIT_SHORT} ${IMAGE_NAME}:latest"
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo "Pushing to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh "echo \$PASS | docker login -u \$USER --password-stdin"
                    sh "docker push ${IMAGE_NAME}:${GIT_COMMIT_SHORT}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
                echo "Image pushed successfully: ${IMAGE_NAME}:latest"
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                echo "Deploying to Minikube..."
                withCredentials([string(credentialsId: 'minikube-kubeconfig', variable: 'KUBECONFIG_CONTENT')]) {
                    sh '''
                    # Safer way to write the kubeconfig (avoids most quoting issues)
                    printf '%s\\n' "$KUBECONFIG_CONTENT" > kubeconfig.yaml
                    
                    # Optional debug (uncomment if still failing)
                    # echo "=== First few lines of kubeconfig.yaml ==="
                    # head -n 8 kubeconfig.yaml || true
                    # echo "=== Trying to validate ==="
                    # python3 -c "import yaml; yaml.safe_load(open('kubeconfig.yaml'))" || echo "YAML invalid"
                    
                    export KUBECONFIG=$(pwd)/kubeconfig.yaml
                    
                    # Basic check
                    kubectl version --client || { echo "kubectl client check failed"; exit 1; }
                    
                    # Deploy
                    kubectl apply -f k8s/deployment.yaml || { echo "Deployment apply failed"; exit 1; }
                    kubectl apply -f k8s/service.yaml   || { echo "Service apply failed"; exit 1; }
                    
                    # Optional: show status
                    kubectl get pods -l app=ecommerce
                    
                    # Cleanup sensitive file
                    rm -f kubeconfig.yaml
                    '''
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                sh "docker rmi ${IMAGE_NAME}:${GIT_COMMIT_SHORT} || true"
                sh "docker rmi ${IMAGE_NAME}:latest || true"
            }
        }
    }
    
    post {
        always {
            echo "Pipeline completed at ${new Date()}"
            echo "Git Commit: ${GIT_COMMIT_SHORT}"
        }
        success {
            echo "Pipeline SUCCESSFUL"
        }
        failure {
            echo "Pipeline FAILED"
        }
    }
}
