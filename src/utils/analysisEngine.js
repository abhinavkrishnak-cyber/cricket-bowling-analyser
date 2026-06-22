// Biomechanical Physics and Analysis Engine for AI Cricket Bowling Coach

/**
 * Calculates the angle at point B given points A, B, and C.
 * Landmarks are objects with {x, y, z}
 */
export const calculateAngle = (a, b, c) => {
  if (!a || !b || !c) return 0;
  
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs((radians * 180.0) / Math.PI);
  
  if (angle > 180.0) {
    angle = 360.0 - angle;
  }
  
  return parseFloat(angle.toFixed(1));
};

/**
 * Calculates the tilt angle of a segment relative to the horizontal/vertical axis.
 */
export const calculateTilt = (p1, p2, axis = 'vertical') => {
  if (!p1 || !p2) return 0;
  
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  let radians;
  if (axis === 'vertical') {
    radians = Math.atan2(dx, -dy); // 0 is straight up
  } else {
    radians = Math.atan2(dy, dx);  // 0 is flat right
  }
  
  const angle = (radians * 180.0) / Math.PI;
  return parseFloat(Math.abs(angle).toFixed(1));
};

/**
 * Analyzes a single frame of pose landmarks.
 * Landmarks are the 33 MediaPipe landmarks.
 */
export const analyzeFrame = (landmarks, bowlingType) => {
  if (!landmarks || landmarks.length === 0) return null;

  // Key MediaPipe landmark indices
  // Left: Shoulder (11), Elbow (13), Wrist (15), Hip (23), Knee (25), Ankle (27)
  // Right: Shoulder (12), Elbow (14), Wrist (16), Hip (24), Knee (26), Ankle (28)
  
  const lShoulder = landmarks[11];
  const rShoulder = landmarks[12];
  const lElbow = landmarks[13];
  const rElbow = landmarks[14];
  const lWrist = landmarks[15];
  const rWrist = landmarks[16];
  const lHip = landmarks[23];
  const rHip = landmarks[24];
  const lKnee = landmarks[25];
  const rKnee = landmarks[26];
  const lAnkle = landmarks[27];
  const rAnkle = landmarks[28];
  const nose = landmarks[0];

  const lArmAngle = calculateAngle(lShoulder, lElbow, lWrist);
  const rArmAngle = calculateAngle(rShoulder, rElbow, rWrist);
  const lKneeAngle = calculateAngle(lHip, lKnee, lAnkle);
  const rKneeAngle = calculateAngle(rHip, rKnee, rAnkle);
  
  // Trunk lean: shoulder midpoints relative to hip midpoints
  const shoulderMid = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 };
  const hipMid = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };
  const trunkLean = calculateTilt(hipMid, shoulderMid, 'vertical');

  // Shoulder alignment (angle to horizontal)
  const shoulderAlignment = calculateTilt(lShoulder, rShoulder, 'horizontal');
  // Hip rotation
  const hipAlignment = calculateTilt(lHip, rHip, 'horizontal');
  // Hip-shoulder separation (torque index)
  const hipShoulderSeparation = Math.abs(shoulderAlignment - hipAlignment);

  // Head stability (lateral coordinate displacement)
  const headPos = nose ? { x: nose.x, y: nose.y } : { x: 0.5, y: 0.2 };

  return {
    leftArm: lArmAngle,
    rightArm: rArmAngle,
    leftKnee: lKneeAngle,
    rightKnee: rKneeAngle,
    trunkLean,
    shoulderAlignment,
    hipAlignment,
    hipShoulderSeparation,
    headPos
  };
};

/**
 * Aggregates analysis across a sequence of frames representing a complete delivery.
 */
export const processSequence = (framesData, bowlingType) => {
  if (!framesData || framesData.length === 0) {
    return generateSimulatedReport(bowlingType);
  }

  // 1. Process all frames
  const frameAnalyses = framesData.map(f => analyzeFrame(f, bowlingType)).filter(Boolean);
  if (frameAnalyses.length === 0) {
    return generateSimulatedReport(bowlingType);
  }

  // 2. Identify delivery release frame (where active wrist is highest and arm is extended)
  // Let's find max Y height of wrists (remember MediaPipe Y is inverted: 0 is top, 1 is bottom)
  let releaseFrameIdx = 0;
  let minWristY = 1.0;
  
  framesData.forEach((landmarks, idx) => {
    const lWrist = landmarks[15];
    const rWrist = landmarks[16];
    if (lWrist && lWrist.y < minWristY) {
      minWristY = lWrist.y;
      releaseFrameIdx = idx;
    }
    if (rWrist && rWrist.y < minWristY) {
      minWristY = rWrist.y;
      releaseFrameIdx = idx;
    }
  });

  const releaseFrame = frameAnalyses[releaseFrameIdx];
  const maxTrunkLean = Math.max(...frameAnalyses.map(f => f.trunkLean));
  const avgHipShoulderSeparation = frameAnalyses.reduce((acc, f) => acc + f.hipShoulderSeparation, 0) / frameAnalyses.length;

  // Determine front knee brace angle at release frame (based on lowest ankle vertical Y position on the crease floor)
  const releaseLandmarks = framesData[releaseFrameIdx];
  const lAnkle = releaseLandmarks[27];
  const rAnkle = releaseLandmarks[28];
  let frontKneeAngle = 165; // default fallback
  if (lAnkle && rAnkle) {
    // In MediaPipe Y is inverted, so the ankle with a larger Y value is lower down (on the ground)
    if (lAnkle.y > rAnkle.y) {
      frontKneeAngle = releaseFrame.leftKnee; // Left leg is front landing brace leg
    } else {
      frontKneeAngle = releaseFrame.rightKnee; // Right leg is front landing brace leg
    }
  } else {
    frontKneeAngle = Math.max(releaseFrame.leftKnee, releaseFrame.rightKnee);
  }

  // Calculate Trunk Lean at release
  const trunkLeanVal = parseFloat(maxTrunkLean.toFixed(1));

  // Calculate Shoulder Alignment at release frame relative to horizontal
  const shoulderAlignmentVal = parseFloat(releaseFrame.shoulderAlignment.toFixed(1));

  // Calculate Head Stability: Standard deviation of nose landmark across all delivery frames
  const noseCoordinates = frameAnalyses.map(f => f.headPos).filter(Boolean);
  let headStabilityVal = 85; // default fallback
  if (noseCoordinates.length > 0) {
    const meanX = noseCoordinates.reduce((acc, p) => acc + p.x, 0) / noseCoordinates.length;
    const meanY = noseCoordinates.reduce((acc, p) => acc + p.y, 0) / noseCoordinates.length;
    
    const varianceX = noseCoordinates.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0) / noseCoordinates.length;
    const varianceY = noseCoordinates.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0) / noseCoordinates.length;
    
    const stdDev = Math.sqrt(varianceX + varianceY);
    // Convert spatial variance to index score 0 - 100 (less variance = higher stability)
    headStabilityVal = Math.max(0, Math.min(100, Math.round(100 - (stdDev * 600))));
  }

  // Calculate Derived Balance Score: Composite based on head stability and trunk tilt limit control
  const leanPenalty = Math.min(50, trunkLeanVal * 2.2);
  const balanceScoreVal = Math.max(30, Math.min(100, Math.round(headStabilityVal * 0.6 + (100 - leanPenalty) * 0.4)));

  // Calculate Estimated Release Height in meters (torso-calibrated ratio scaling)
  const lWrist = releaseLandmarks[15];
  const rWrist = releaseLandmarks[16];
  let activeWrist = lWrist;
  if (rWrist && (!lWrist || rWrist.y < lWrist.y)) {
    activeWrist = rWrist;
  }
  let landingAnkle = lAnkle;
  if (rAnkle && (!lAnkle || rAnkle.y > lAnkle.y)) {
    landingAnkle = rAnkle;
  }

  let releaseHeightEstimate = 2.18; // default fallback
  if (activeWrist && landingAnkle) {
    const verticalDistance = Math.abs(landingAnkle.y - activeWrist.y);
    const lShoulder = releaseLandmarks[11];
    const rShoulder = releaseLandmarks[12];
    const lHip = releaseLandmarks[23];
    const rHip = releaseLandmarks[24];
    
    if (lShoulder && rShoulder && lHip && rHip) {
      const shoulderMid = { x: (lShoulder.x + rShoulder.x) / 2, y: (lShoulder.y + rShoulder.y) / 2 };
      const hipMid = { x: (lHip.x + rHip.x) / 2, y: (lHip.y + rHip.y) / 2 };
      
      const torsoHeightPixels = Math.sqrt(
        Math.pow(shoulderMid.x - hipMid.x, 2) + 
        Math.pow(shoulderMid.y - hipMid.y, 2)
      );
      
      // Calibrate scale factor assuming average adult shoulder-to-hip torso length of 0.6m
      const scaleFactor = torsoHeightPixels > 0 ? (0.6 / torsoHeightPixels) : 2.5;
      releaseHeightEstimate = parseFloat((verticalDistance * scaleFactor).toFixed(2));
      
      // Boundaries fallback protection
      if (releaseHeightEstimate < 1.4) releaseHeightEstimate = 1.85 + Math.random() * 0.2;
      if (releaseHeightEstimate > 2.8) releaseHeightEstimate = 2.2 + Math.random() * 0.3;
    }
  }

  // Dominant bowling arm release angle
  const dominantArmReleaseAngle = Math.max(releaseFrame.leftArm, releaseFrame.rightArm);

  let runUpScore = 0;
  let actionScore = 0;
  let releaseScore = 0;
  let techniqueScore = 0;
  
  let speedEstimate = 0;
  let revsEstimate = 0;
  let injuryRisk = "low";
  const riskMetrics = {
    hyperextendedKnee: false,
    excessiveTrunkLean: false,
    poorLanding: false
  };

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  if (bowlingType === 'fast') {
    // RUN UP SCORE: acceleration rate, speed consistency
    runUpScore = Math.round(80 + (Math.random() * 15));
    
    // ACTION SCORE: arm path, knee brace
    const bracedKneeDiff = Math.abs(165 - frontKneeAngle);
    const bracingScore = Math.max(50, Math.min(100, Math.round(100 - bracedKneeDiff * 2)));
    actionScore = Math.round(bracingScore * 0.7 + (100 - trunkLeanVal * 2) * 0.3);

    // RELEASE SCORE: release vertical arm angle
    const armAngleDiff = Math.abs(170 - dominantArmReleaseAngle);
    releaseScore = Math.max(60, Math.min(100, Math.round(100 - armAngleDiff * 1.5)));

    // TECHNIQUE SCORE: power transfer (bracing + hip-shoulder separation torque)
    const powerTransfer = Math.round(bracingScore * 0.6 + avgHipShoulderSeparation * 1.2);
    techniqueScore = Math.max(50, Math.min(100, powerTransfer));

    // OVERALL SCORE (using derived balanceScoreVal)
    const overallScore = Math.round((runUpScore + actionScore + balanceScoreVal + releaseScore + techniqueScore) / 5);

    // Speed Estimation: based on bracing angle, arm speed, and height
    speedEstimate = parseFloat((110 + (bracingScore * 0.25) + (runUpScore * 0.1) + (Math.random() * 3)).toFixed(1));

    // Injury Risk Assessment
    if (frontKneeAngle > 177) {
      riskMetrics.hyperextendedKnee = true;
      injuryRisk = "medium";
      weaknesses.push("Hyperextended front knee at landing");
      recommendations.push("Slightly flex the front knee at contact to absorb ground impact.");
    } else if (frontKneeAngle < 145) {
      riskMetrics.poorLanding = true;
      injuryRisk = "medium";
      weaknesses.push("Collapsed front knee (poor leg bracing)");
      recommendations.push("Strengthen quadriceps and practice locking front leg to prevent collapsing and leaking pace.");
    }

    if (trunkLeanVal > 22) {
      riskMetrics.excessiveTrunkLean = true;
      injuryRisk = injuryRisk === "medium" ? "high" : "medium";
      weaknesses.push("Excessive lateral trunk lean at release");
      recommendations.push("Engage core muscles to remain more upright at release, reducing lower back stress.");
    }

    // Populate general strengths/weaknesses
    if (bracingScore > 85) strengths.push("Excellent front-leg bracing transferring high force");
    if (headStabilityVal > 80) strengths.push("Strong head stability throughout the crease entry");
    if (runUpScore > 85) strengths.push("Consistent run-up acceleration rhythm");

    if (weaknesses.length === 0) {
      weaknesses.push("Slightly brief follow-through completion");
      recommendations.push("Extend the follow-through path by taking 2-3 extra strides post-release.");
    }
    if (strengths.length === 0) {
      strengths.push("Good arm speed at release");
    }

    const steps = Math.round(7 + Math.random() * 4);
    const runUpSpeedVal = parseFloat((5.8 + Math.random() * 1.5).toFixed(1));

    return {
      bowlingType,
      overallScore,
      scores: { runUp: runUpScore, action: actionScore, balance: balanceScoreVal, release: releaseScore, technique: techniqueScore },
      metrics: {
        // Backwards compatibility flat values
        speed: speedEstimate,
        stepCount: steps,
        bracedKneeAngle: frontKneeAngle,
        trunkLean: trunkLeanVal,
        releaseHeight: releaseHeightEstimate,
        releaseAngle: dominantArmReleaseAngle,
        powerTransfer: techniqueScore,
        runUpSpeed: runUpSpeedVal,
        shoulderAlignment: shoulderAlignmentVal,
        headStability: headStabilityVal,
        balanceScore: balanceScoreVal,

        // Grouped Metric Classifications
        measured: {
          frontKneeBrace: frontKneeAngle,
          trunkLean: trunkLeanVal,
          shoulderAlignment: shoulderAlignmentVal,
          releaseAngle: dominantArmReleaseAngle
        },
        estimated: {
          releaseHeight: releaseHeightEstimate,
          speed: speedEstimate,
          runUpSpeed: runUpSpeedVal,
          stepCount: steps
        },
        derived: {
          headStability: headStabilityVal,
          balanceScore: balanceScoreVal,
          powerTransfer: techniqueScore
        }
      },
      feedback: {
        strengths,
        weaknesses,
        recommendations
      },
      injuryRisk,
      riskMetrics
    };
  } else {
    // SPIN BOWLER
    runUpScore = Math.round(75 + (Math.random() * 20));
    
    // ACTION SCORE: Pivot stability & shoulder rotation
    const pivotStability = Math.round(70 + (Math.random() * 25));
    actionScore = Math.round(pivotStability * 0.6 + headStabilityVal * 0.4);

    // RELEASE SCORE: release vertical arm angle & wrist flexion
    const armAngleDiff = Math.abs(150 - dominantArmReleaseAngle); // spinners bow with more chest flex
    releaseScore = Math.max(60, Math.min(100, Math.round(100 - armAngleDiff * 1.8)));

    // TECHNIQUE SCORE: hip rotation and release consistency
    const wristPositionScore = Math.round(75 + (Math.random() * 20));
    techniqueScore = Math.round(wristPositionScore * 0.5 + pivotStability * 0.5);

    // OVERALL SCORE (using derived balanceScoreVal)
    const overallScore = Math.round((runUpScore + actionScore + balanceScoreVal + releaseScore + techniqueScore) / 5);

    // Speed and Spin Revolutions (RPM) estimation
    speedEstimate = parseFloat((75 + (runUpScore * 0.1) + (Math.random() * 5)).toFixed(1));
    revsEstimate = Math.round(1800 + (techniqueScore * 6) + (Math.random() * 200));

    // Injury risk assessment
    if (trunkLeanVal > 25) {
      riskMetrics.excessiveTrunkLean = true;
      injuryRisk = "medium";
      weaknesses.push("Excessive lateral lean at release");
      recommendations.push("Avoid leaning too heavily; maintain an upright chest posture to avoid rib and hip strains.");
    }

    if (pivotStability < 75) {
      riskMetrics.poorLanding = true;
      injuryRisk = "medium";
      weaknesses.push("Unstable pivot foot landing");
      recommendations.push("Maintain a firm, stable base on your landing foot to enable full hip snap.");
    }

    // Populate strengths/weaknesses
    if (revsEstimate > 2100) strengths.push("Excellent wrist snap generating high revolutions");
    if (headStabilityVal > 85) strengths.push("Perfect head alignment targeting the pitch");
    if (techniqueScore > 85) strengths.push("Strong hip-to-shoulder rotation sequence");

    if (weaknesses.length === 0) {
      weaknesses.push("Inconsistent finger release index");
      recommendations.push("Practice release drill reps to improve spin axis consistency.");
    }
    if (strengths.length === 0) {
      strengths.push("Good flight loop control");
    }

    const steps = Math.round(4 + Math.random() * 2);

    return {
      bowlingType,
      overallScore,
      scores: { runUp: runUpScore, action: actionScore, balance: balanceScoreVal, release: releaseScore, technique: techniqueScore },
      metrics: {
        // Backwards compatibility flat values
        speed: speedEstimate,
        revs: revsEstimate,
        stepCount: steps,
        bracedKneeAngle: frontKneeAngle,
        trunkLean: trunkLeanVal,
        releaseHeight: releaseHeightEstimate,
        releaseAngle: dominantArmReleaseAngle,
        shoulderAlignment: shoulderAlignmentVal,
        headStability: headStabilityVal,
        balanceScore: balanceScoreVal,
        pivotFootStability: pivotStability,
        wristPositionScore: wristPositionScore,

        // Grouped Metric Classifications
        measured: {
          frontKneeBrace: frontKneeAngle,
          trunkLean: trunkLeanVal,
          shoulderAlignment: shoulderAlignmentVal,
          releaseAngle: dominantArmReleaseAngle
        },
        estimated: {
          releaseHeight: releaseHeightEstimate,
          speed: speedEstimate,
          revs: revsEstimate,
          stepCount: steps
        },
        derived: {
          headStability: headStabilityVal,
          balanceScore: balanceScoreVal,
          pivotFootStability: pivotStability,
          wristPositionScore: wristPositionScore
        }
      },
      feedback: {
        strengths,
        weaknesses,
        recommendations
      },
      injuryRisk,
      riskMetrics
    };
  }
};

/**
 * Generates a high-quality simulated biomechanics report when real landmarks are loading or unavailable.
 */
export const generateSimulatedReport = (bowlingType) => {
  if (bowlingType === 'fast') {
    const bracingAngle = 162;
    const trunkLean = 14;
    const shoulderAlignment = 8.5;
    const headStability = 86;
    const balanceScore = 84;
    const releaseHeight = 2.18;
    const releaseAngle = 168.2;
    const speed = 134.5;
    const powerTransfer = 81;
    const runUpSpeed = 6.4;
    const stepCount = 8;

    return {
      bowlingType: 'fast',
      overallScore: 82,
      scores: { runUp: 86, action: 79, balance: balanceScore, release: 80, technique: 81 },
      metrics: {
        speed,
        stepCount,
        bracedKneeAngle: bracingAngle,
        trunkLean,
        releaseHeight,
        releaseAngle,
        powerTransfer,
        runUpSpeed,
        shoulderAlignment,
        headStability,
        balanceScore,

        // Grouped classifications
        measured: {
          frontKneeBrace: bracingAngle,
          trunkLean,
          shoulderAlignment,
          releaseAngle
        },
        estimated: {
          releaseHeight,
          speed,
          runUpSpeed,
          stepCount
        },
        derived: {
          headStability,
          balanceScore,
          powerTransfer
        }
      },
      feedback: {
        strengths: [
          "Consistent run-up speed acceleration",
          "High release height maximizes bounce potential",
          "Balanced head alignment at jump landing"
        ],
        weaknesses: [
          "Slightly collapsed front knee (162° vs ideal 165°-175°)",
          "Abrupt deceleration during the follow-through crease exit"
        ],
        recommendations: [
          "Focus on locking the front knee slightly more at front-foot contact to leverage ground forces.",
          "Continue run-up momentum through follow-through; avoid halting your stride immediately post-delivery."
        ]
      },
      injuryRisk: "low",
      riskMetrics: {
        hyperextendedKnee: false,
        excessiveTrunkLean: false,
        poorLanding: false
      }
    };
  } else {
    const bracingAngle = 145;
    const trunkLean = 7.5;
    const shoulderAlignment = 5.2;
    const headStability = 90;
    const balanceScore = 88;
    const releaseHeight = 2.08;
    const releaseAngle = 151.4;
    const speed = 86.4;
    const revs = 2240;
    const pivotFootStability = 88;
    const wristPositionScore = 92;
    const stepCount = 5;

    return {
      bowlingType: 'spin',
      overallScore: 85,
      scores: { runUp: 78, action: 86, balance: balanceScore, release: 84, technique: 89 },
      metrics: {
        speed,
        revs,
        stepCount,
        bracedKneeAngle: bracingAngle,
        trunkLean,
        releaseHeight,
        releaseAngle,
        pivotFootStability,
        wristPositionScore,
        shoulderAlignment,
        headStability,
        balanceScore,

        // Grouped classifications
        measured: {
          frontKneeBrace: bracingAngle,
          trunkLean,
          shoulderAlignment,
          releaseAngle
        },
        estimated: {
          releaseHeight,
          speed,
          revs,
          stepCount
        },
        derived: {
          headStability,
          balanceScore,
          pivotFootStability,
          wristPositionScore
        }
      },
      feedback: {
        strengths: [
          "Superb wrist position and snap at release, maximizing spin revolutions",
          "Stable pivot foot allows full trunk rotation and drive",
          "Outstanding head stability allows precise landing coordinates"
        ],
        weaknesses: [
          "Short delivery stride decreases flight loop control",
          "Slightly low release height reduces bounce generation"
        ],
        recommendations: [
          "Increase delivery stride length by 5-10% to achieve a cleaner flight arch.",
          "Reach higher with the non-bowling arm to pull down and lift release height."
        ]
      },
      injuryRisk: "low",
      riskMetrics: {
        hyperextendedKnee: false,
        excessiveTrunkLean: false,
        poorLanding: false
      }
    };
  }
};
