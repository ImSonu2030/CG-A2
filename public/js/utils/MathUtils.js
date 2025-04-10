export class MathUtils {
    static quadraticInterpolation(p0, p1, p2, t) {
        const t2 = t * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        
        return [
            mt2 * p0[0] + 2 * mt * t * p1[0] + t2 * p2[0],
            mt2 * p0[1] + 2 * mt * t * p1[1] + t2 * p2[1],
            mt2 * p0[2] + 2 * mt * t * p1[2] + t2 * p2[2]
        ];
    }
    
    static screenToWorldCoordinates(clipX, clipY, canvas, orthoScale) { 
        const aspect = canvas.clientWidth / canvas.clientHeight;
        const orthoWidth = orthoScale * aspect;
        
        const worldX = clipX * orthoWidth;
        const worldZ = -clipY * orthoScale;
        return [worldX, 0, worldZ]; 
    }
    static degToRad(degrees) {return degrees * Math.PI / 180;}
    static radToDeg(radians) {return radians * 180 / Math.PI;}
    static clamp(value, min, max) {return Math.max(min, Math.min(max, value));}
}