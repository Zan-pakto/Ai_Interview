export interface FaceAnalysisResult {
  confidence: number;       // 0 - 100
  eyeContact: boolean;     // Whether looking at the screen
  primaryExpression: string; // Neutral, happy, focused, etc.
}

/**
 * Calculates eye contact based on 68-point facial landmarks.
 * Analyzes vertical and horizontal alignment of head and eye structures.
 */
export function calculateEyeContact(landmarks: any): boolean {
  if (!landmarks) return false;

  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  if (!leftEye || !rightEye || leftEye.length < 4 || rightEye.length < 1) return false;

  // Measure head rotation/tilt by checking eye alignment and vertical difference
  const eyeDistance = Math.abs(rightEye[0].x - leftEye[3].x);
  const eyeYDiff = Math.abs(rightEye[0].y - leftEye[0].y);

  // If head is excessively tilted vertically, eye contact is lost
  if (eyeYDiff > eyeDistance * 0.18) {
    return false; 
  }

  return true; // Candidate is looking relatively forward at the screen
}

/**
 * Maps raw expressions from face-api to an Interview Confidence score (10-100)
 */
export function calculateConfidence(expressions: any, eyeContact: boolean): number {
  if (!expressions) return 75;

  const { neutral = 0, happy = 0, surprised = 0, sad = 0, angry = 0, fearful = 0, disgusted = 0 } = expressions;

  // Positive/Confident base
  const positiveBasis = (neutral * 1.0) + (happy * 0.8);

  // Negative/Anxious/Tense base
  const anxiousBasis = (fearful * 1.0) + (sad * 0.8) + (surprised * 0.4) + (angry * 0.4) + (disgusted * 0.4);

  // Base score calculation
  let score = Math.round((positiveBasis - anxiousBasis) * 100);

  // Eye contact penalty
  if (!eyeContact) {
    score -= 20;
  } else {
    score += 15; // Confidence boost for keeping gaze
  }

  // Bound the score between 10 and 100
  return Math.max(10, Math.min(100, score));
}
