export class Model {
    constructor(name, vertices = [], normals = [], indices = [], initialTransform = null) {
        this.name = name;
        this.vertices = vertices;
        this.normals = normals;
        this.indices = indices;
        this.buffers = null;
        
        this.transform = initialTransform || { 
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        };
        
        this.modelMatrix = mat4.create();
        this.rotationMatrix = mat4.create(); 
    }
    
    initBuffers(gl) {
        if (!this.vertices.length) return null;
        
        this.buffers = {
            position: gl.createBuffer(),
            normal: gl.createBuffer(),
            indices: gl.createBuffer(),
            count: this.indices.length
        };
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.position);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normal);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
        
        return this.buffers;
    }
    
    updateModelMatrix(viewMatrix) {
        mat4.copy(this.modelMatrix, viewMatrix);
        
        mat4.translate(this.modelMatrix, this.modelMatrix, this.transform.position);
        
        const rotQuat = quat.create();
        quat.fromEuler(
            rotQuat, 
            this.transform.rotation[0] * 180 / Math.PI,
            this.transform.rotation[1] * 180 / Math.PI, 
            this.transform.rotation[2] * 180 / Math.PI
        );
        mat4.fromQuat(this.rotationMatrix, rotQuat);
        mat4.multiply(this.modelMatrix, this.modelMatrix, this.rotationMatrix);
        
        mat4.scale(this.modelMatrix, this.modelMatrix, this.transform.scale);
    }
}