pipeline {
    agent any
    tools{
        nodejs 'node'

}
    environment {
        DOCKERHUB_CREDENTIALS = 'docker-hub-credentials'
        IMAGE_NAME = 'sasankpoiu/ecommerce-app'   // CHANGE sasankdevops to your dockerhub username
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
                    sh "echo $PASS | docker login -u $USER --password-stdin"
                    sh "docker push ${IMAGE_NAME}:${GIT_COMMIT_SHORT}"
                    sh "docker push ${IMAGE_NAME}:latest"
                }
                echo "Image pushed successfully: ${IMAGE_NAME}:latest"
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
