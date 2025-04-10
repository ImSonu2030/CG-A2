const vertexShaderSource = `
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `;
