
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Tools') {
            steps {
                bat 'node --version'
                bat 'npm --version'
                bat 'git --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm ci'
                bat 'npm install --prefix integration/client'
            }
        }

        stage('Build Frontend') {
            steps {
                bat 'npm run build:client'
            }
        }

        stage('Validate Kubernetes Manifests') {
            steps {
                script {
                    def hasKubectl = bat(script: 'where kubectl', returnStatus: true) == 0
                    if (hasKubectl) {
                        bat 'kubectl apply --dry-run=client -f k8s/'
                    } else {
                        echo 'kubectl not detected on build agent; skipping Kubernetes manifest dry-run.'
                    }
                }
            }
        }

        stage('Test Application') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'student-expenses-jwt-secret',
                        variable: 'JWT_SECRET'
                    )
                ]) {
                    withEnv([
                        'MONGODB_URI=mongodb://127.0.0.1:27017/student_expense_db'
                    ]) {
                        bat 'npm test'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Build and tests completed.'
        }

        failure {
            echo 'FAILURE: Check the Jenkins Console Output.'
        }

        always {
            echo 'Student Expenses Management CI pipeline finished.'
        }
    }
}
