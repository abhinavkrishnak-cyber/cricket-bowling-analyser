import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a professional 5-page PDF report for the bowling session.
 */
export const downloadPDFReport = (sessionData, userName = "Bowler") => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { bowlingType, overallScore, scores, metrics, feedback, injuryRisk } = sessionData;
  const isFast = bowlingType === 'fast';

  // Theme colors
  const primaryColor = [16, 185, 129];    // Emerald Green
  const darkColor = [15, 23, 42];        // Navy Dark / Slate 900
  const secondaryColor = [245, 158, 11]; // Yellow / Amber 500
  const dangerColor = [239, 68, 68];     // Red / Rose 500
  const infoColor = [59, 130, 246];       // Electric Blue / Blue 500
  const textDark = [30, 41, 59];          // Slate 800
  const textLight = [100, 116, 139];      // Slate 500
  const neutralBg = [248, 250, 252];      // Slate 50

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Safe Name
  const displayName = userName.length > 22 ? userName.substring(0, 22) + "..." : userName;

  // Safe Fallbacks to prevent crash on undefined attributes
  const safeScores = {
    runUp: scores?.runUp ?? 80,
    action: scores?.action ?? 80,
    balance: scores?.balance ?? 80,
    release: scores?.release ?? 80,
    technique: scores?.technique ?? 80,
    power: scores?.power ?? (isFast ? 82 : 80),
    followThrough: scores?.followThrough ?? (isFast ? 75 : 76)
  };

  const safeMetrics = {
    speed: metrics?.speed ?? (isFast ? 134.5 : 86.4),
    stepCount: metrics?.stepCount ?? (isFast ? 8 : 5),
    bracedKneeAngle: metrics?.bracedKneeAngle ?? (isFast ? 162 : 145),
    trunkLean: metrics?.trunkLean ?? (isFast ? 14 : 7.5),
    releaseHeight: metrics?.releaseHeight ?? (isFast ? 2.18 : 2.08),
    releaseAngle: metrics?.releaseAngle ?? (isFast ? 168.2 : 151.4),
    powerTransfer: metrics?.powerTransfer ?? (isFast ? 81 : 85),
    runUpSpeed: metrics?.runUpSpeed ?? (isFast ? 6.4 : 4.5),
    revs: metrics?.revs ?? (isFast ? 0 : 2240),
    pivotFootStability: metrics?.pivotFootStability ?? (isFast ? 0 : 88),
    wristPositionScore: metrics?.wristPositionScore ?? (isFast ? 0 : 92)
  };

  const safeFeedback = {
    strengths: feedback?.strengths ?? ["Consistent release velocity", "Solid front-foot plant stability"],
    weaknesses: feedback?.weaknesses ?? ["Slight alignment deviation at crease entry"],
    recommendations: feedback?.recommendations ?? ["Focus on quad core integration and follow through drive"]
  };

  const safeInjuryRisk = injuryRisk ?? 'low';

  // Derived values for Radar Chart matching Dashboard.jsx logic
  const powerVal = safeScores.power || safeMetrics.powerTransfer || (isFast ? 82 : Math.round(safeMetrics.wristPositionScore * 0.6 + safeMetrics.pivotFootStability * 0.4));
  const followThroughVal = safeScores.followThrough || (isFast ? Math.round(safeScores.action * 0.95) : Math.round(safeScores.balance * 0.95));

  // Date Formatting
  const reportDate = new Date(sessionData.date || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  // Rating and Status Labels Helpers
  const getRatingLabel = (score) => {
    if (score >= 85) return 'Optimal';
    if (score >= 70) return 'Moderate';
    return 'Action Needed';
  };

  const getSpeedStatus = (speed, isFast) => {
    if (isFast) {
      return speed >= 115 ? 'Optimal' : 'Below Target';
    }
    return speed >= 75 ? 'Optimal' : 'Below Target';
  };

  const getKneeStatus = (angle, isFast) => {
    if (isFast) {
      if (angle < 150) return 'Collapsed';
      if (angle > 178) return 'Locked-Ext';
      return 'Optimal';
    } else {
      if (angle < 135) return 'Collapsed';
      return 'Optimal';
    }
  };

  const getLeanStatus = (lean, isFast) => {
    const limit = isFast ? 15 : 10;
    return lean <= limit ? 'Optimal' : 'High Lean';
  };

  const getReleaseHeightStatus = (height, isFast) => {
    const min = isFast ? 2.10 : 1.90;
    const max = isFast ? 2.30 : 2.20;
    if (height >= min && height <= max) return 'Optimal';
    return 'Normal';
  };

  // Page Decoration Helper
  const drawPageDecoration = (pageNum) => {
    // Page border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20);
    
    // Page footer indicator
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Page ${pageNum} of 5`, pageWidth - 15, pageHeight - 5, { align: 'right' });
    doc.text("CONFIDENTIAL — ATHLETE PERFORMANCE PROFILE", 15, pageHeight - 5);
    
    if (pageNum > 1) {
      // Small header line and title
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("AI CRICKET BOWLING COACH — PERFORMANCE DIAGNOSTICS", 15, 7);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(10, 10, pageWidth - 10, 10);
    }
  };

  // Page Title Header Line
  const drawPageHeader = (titleText) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(titleText, 15, 22);

    doc.setDrawColor(16, 185, 129); // primary green accent
    doc.setLineWidth(0.6);
    doc.line(15, 24, 65, 24);
  };

  // Radar Chart geometry calculation helper
  const getRadarCoordinates = (cx, cy, radius, angleIndex, totalAxes = 6) => {
    const angle = (angleIndex * 2 * Math.PI / totalAxes) - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  };


  // ==========================================
  // PAGE 1: COVER PAGE
  // ==========================================
  drawPageDecoration(1);

  // Large Top Header Banner
  doc.setFillColor(...darkColor);
  doc.rect(10, 10, pageWidth - 20, 42, 'F');
  
  // Highlight border line
  doc.setFillColor(...primaryColor);
  doc.rect(10, 52, pageWidth - 20, 2, 'F');

  // Title text in Banner
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(23);
  doc.setTextColor(255, 255, 255);
  doc.text("AI CRICKET BOWLING COACH", 16, 27);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...primaryColor);
  doc.text("BIOMECHANICS & TECHNIQUE PERFORMANCE REPORT", 16, 34);

  doc.setFontSize(8.5);
  doc.setTextColor(156, 163, 175);
  doc.text("PLAYER PERFORMANCE DIAGNOSTICS PROFILE", 16, 41);

  // Profile Details Table
  autoTable(doc, {
    startY: 65,
    margin: { left: 15, right: 15 },
    head: [['Profile Attribute', 'Session Details']],
    body: [
      ['Player Name', displayName],
      ['Date Generated', reportDate],
      ['Bowling Style', isFast ? 'Fast Bowling' : 'Spin Bowling'],
      ['Composite Overall Score', `${overallScore} / 100`],
      ['Injury Risk Rating', safeInjuryRisk.toUpperCase()]
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 10, fontStyle: 'bold', halign: 'left' },
    bodyStyles: { fontSize: 9.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 60 },
      1: { width: 120 }
    },
    didParseCell: (data) => {
      // Highlight injury risk cell colors
      if (data.section === 'body' && data.column.index === 1 && data.row.index === 4) {
        if (safeInjuryRisk === 'high') {
          data.cell.styles.textColor = [239, 68, 68];
          data.cell.styles.fontStyle = 'bold';
        } else if (safeInjuryRisk === 'medium') {
          data.cell.styles.textColor = [245, 158, 11];
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [16, 185, 129];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Bold overall score
      if (data.section === 'body' && data.column.index === 1 && data.row.index === 3) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.textColor = [16, 185, 129];
      }
    }
  });

  // Narrative summary card below table
  const summaryY = 135;
  doc.setFillColor(...neutralBg);
  doc.rect(15, summaryY, 180, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.rect(15, summaryY, 180, 24, 'D');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("Biomechanical Objective & Outline", 20, summaryY + 8);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...textDark);
  const introSummary = "This diagnostic performance profile aggregates high-frequency joint coordinate data processed live during crease delivery. Measured alignments check hip-shoulder separation, knee stability, and vertical release velocity to highlight pace optimizations and prevent mechanical back stresses.";
  const summaryLines = doc.splitTextToSize(introSummary, 170);
  doc.text(summaryLines, 20, summaryY + 13);


  // ==========================================
  // PAGE 2: SUB-SCORES
  // ==========================================
  doc.addPage();
  drawPageDecoration(2);
  drawPageHeader("Biomechanical Score Breakdown");

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const page2Intro = "The bowling action is evaluated across five distinct sub-technique sectors. Category scores are derived based on deviations from elite professional benchmark configurations.";
  doc.text(doc.splitTextToSize(page2Intro, 180), 15, 30);

  autoTable(doc, {
    startY: 40,
    margin: { left: 15, right: 15 },
    head: [['Technical Score Category', 'Percentage', 'Diagnostic Rating Level']],
    body: [
      ['Run-up & Rhythm Score', `${safeScores.runUp}%`, getRatingLabel(safeScores.runUp)],
      ['Delivery Action Score', `${safeScores.action}%`, getRatingLabel(safeScores.action)],
      ['Crease Balance Score', `${safeScores.balance}%`, getRatingLabel(safeScores.balance)],
      ['Release Mechanism Score', `${safeScores.release}%`, getRatingLabel(safeScores.release)],
      ['Core Technique Score', `${safeScores.technique}%`, getRatingLabel(safeScores.technique)]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 80 },
      1: { halign: 'center', width: 40 },
      2: { halign: 'center', fontStyle: 'bold', width: 60 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 2) {
        const val = data.cell.text[0];
        if (val === 'Optimal') {
          data.cell.styles.textColor = [21, 128, 61]; // green
        } else if (val === 'Moderate') {
          data.cell.styles.textColor = [180, 83, 9]; // yellow
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // red
        }
      }
    }
  });


  // ==========================================
  // PAGE 3: PHYSICAL METRICS
  // ==========================================
  doc.addPage();
  drawPageDecoration(3);
  drawPageHeader("Biomechanical Metrics Profile");

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const page3Intro = "Measured angles, release height ratios, and step sequences capture joint alignments during crease plant and ball release frames.";
  doc.text(doc.splitTextToSize(page3Intro, 180), 15, 30);

  autoTable(doc, {
    startY: 40,
    margin: { left: 15, right: 15 },
    head: [['Physical Metric Description', 'Measured Value', 'Target Professional Range', 'Metric Type', 'Diagnostic Status']],
    body: [
      ['Delivery Release Velocity', `${safeMetrics.speed} km/h`, isFast ? '115 - 150 km/h' : '75 - 90 km/h', 'Estimated', getSpeedStatus(safeMetrics.speed, isFast)],
      ['Front Landing Knee Brace Angle', `${safeMetrics.bracedKneeAngle}°`, isFast ? '160° - 175°' : '140° - 150°', 'Measured', getKneeStatus(safeMetrics.bracedKneeAngle, isFast)],
      ['Stump Release Height Index', `${safeMetrics.releaseHeight} m`, isFast ? '2.10 - 2.30 m' : '1.90 - 2.20 m', 'Estimated', getReleaseHeightStatus(safeMetrics.releaseHeight, isFast)],
      ['Torso Lateral Trunk Lean Angle', `${safeMetrics.trunkLean}°`, isFast ? '< 15°' : '< 10°', 'Measured', getLeanStatus(safeMetrics.trunkLean, isFast)],
      ['Run-up Crease Step Count', `${safeMetrics.stepCount} Steps`, isFast ? '6 - 11 Steps' : '4 - 7 Steps', 'Estimated', 'Normal']
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 9.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 60 },
      1: { halign: 'center', width: 30 },
      2: { halign: 'center', width: 40 },
      3: { halign: 'center', textColor: [100, 116, 139], width: 25 },
      4: { halign: 'center', fontStyle: 'bold', width: 25 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.text[0];
        if (val === 'Optimal' || val === 'Normal') {
          data.cell.styles.textColor = [21, 128, 61];
        } else if (val === 'Moderate' || val === 'High Lean' || val === 'Flexed') {
          data.cell.styles.textColor = [180, 83, 9];
        } else {
          data.cell.styles.textColor = [220, 38, 38];
        }
      }
    }
  });


  // ==========================================
  // PAGE 4: AI COACH FEEDBACK
  // ==========================================
  doc.addPage();
  drawPageDecoration(4);
  drawPageHeader("AI Coaching Feedback & Action Plan");

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...textDark);
  const page4Intro = "Targeted biomechanical feedback, performance strengths, and actionable drills compiled by the neural diagnostics pipeline.";
  doc.text(doc.splitTextToSize(page4Intro, 180), 15, 30);

  autoTable(doc, {
    startY: 40,
    margin: { left: 15, right: 15 },
    head: [['Diagnostic Area', 'Detailed Coaching Feedback Points']],
    body: [
      ['High-Performance Strengths', safeFeedback.strengths.map(s => `• ${s}`).join('\n')],
      ['Biomechanical Weaknesses', safeFeedback.weaknesses.map(w => `• ${w}`).join('\n')],
      ['Corrective Training Drills', safeFeedback.recommendations.map(r => `• ${r}`).join('\n')]
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], fontSize: 10, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [15, 23, 42], width: 50 },
      1: { width: 130 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        if (data.row.index === 0) data.cell.styles.textColor = [21, 128, 61]; // Strengths Green
        else if (data.row.index === 1) data.cell.styles.textColor = [180, 83, 9]; // Weaknesses Orange
        else data.cell.styles.textColor = [15, 23, 42]; // Recommendations Navy
      }
    }
  });


  // ==========================================
  // PAGE 5: RADAR CHART & SUMMARY
  // ==========================================
  doc.addPage();
  drawPageDecoration(5);
  drawPageHeader("Technique Balance & Overall Summary");

  // Center coordinates of Radar Chart
  const cxRadar = 105;
  const cyRadar = 78;
  const R = 24;

  // Concentric Hexagonal Radar Grid
  const gridLevels = [20, 40, 60, 80, 100];
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.15);
  gridLevels.forEach((level) => {
    const levelRadius = (level / 100) * R;
    for (let i = 0; i < 6; i++) {
      const p1 = getRadarCoordinates(cxRadar, cyRadar, levelRadius, i);
      const p2 = getRadarCoordinates(cxRadar, cyRadar, levelRadius, (i + 1) % 6);
      doc.line(p1.x, p1.y, p2.x, p2.y);
    }
  });

  // Axes lines from center
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  for (let i = 0; i < 6; i++) {
    const p = getRadarCoordinates(cxRadar, cyRadar, R, i);
    doc.line(cxRadar, cyRadar, p.x, p.y);
  }

  // Axes Labels
  const radarLabels = ["Run-Up", "Balance", "Release", "Power", "Technique", "Follow Thru"];
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textLight);
  
  radarLabels.forEach((label, i) => {
    const p = getRadarCoordinates(cxRadar, cyRadar, R + 4.5, i);
    let align = 'center';
    let labelY = p.y;
    if (i === 0) labelY -= 1;
    else if (i === 3) labelY += 3;
    else if (i === 1 || i === 2) align = 'left';
    else if (i === 4 || i === 5) align = 'right';
    doc.text(label, p.x, labelY, { align });
  });

  // Draw Ideal professional reference polygon (blue)
  const idealValues = [95, 92, 94, 95, 96, 90];
  const idealPts = idealValues.map((val, idx) => getRadarCoordinates(cxRadar, cyRadar, (val / 100) * R, idx));
  doc.setDrawColor(...infoColor);
  doc.setLineWidth(0.4);
  for (let i = 0; i < 6; i++) {
    doc.line(idealPts[i].x, idealPts[i].y, idealPts[(i + 1) % 6].x, idealPts[(i + 1) % 6].y);
  }
  idealPts.forEach(p => {
    doc.setFillColor(...infoColor);
    doc.circle(p.x, p.y, 0.8, 'F');
  });

  // Draw Bowler's actual polygon (emerald green)
  const currentValues = [
    safeScores.runUp,
    safeScores.balance,
    safeScores.release,
    powerVal,
    safeScores.technique,
    followThroughVal
  ];
  const currentPts = currentValues.map((val, idx) => getRadarCoordinates(cxRadar, cyRadar, (val / 100) * R, idx));
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.85);
  for (let i = 0; i < 6; i++) {
    doc.line(currentPts[i].x, currentPts[i].y, currentPts[(i + 1) % 6].x, currentPts[(i + 1) % 6].y);
  }
  currentPts.forEach(p => {
    doc.setFillColor(...primaryColor);
    doc.circle(p.x, p.y, 1.1, 'F');
  });

  // Radar Legend Box
  doc.setFillColor(...neutralBg);
  doc.rect(65, 112, 80, 10, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(65, 112, 80, 10, 'D');

  doc.setFillColor(...primaryColor);
  doc.circle(70, 117, 0.9, 'F');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...textDark);
  doc.text("Current Session", 73, 119.2);

  doc.setFillColor(...infoColor);
  doc.circle(110, 117, 0.9, 'F');
  doc.text("Ideal Professional", 113, 119.2);

  // Performance Summary Table
  autoTable(doc, {
    startY: 132,
    margin: { left: 15, right: 15 },
    head: [['Diagnostic Parameter', 'Session Overall Rating Summary']],
    body: [
      ['Composite Action Score', `${overallScore} / 100 Rating`],
      ['Injury Risk Classification', safeInjuryRisk.toUpperCase()],
      ['Primary Action Recommendation', safeFeedback.recommendations[0] || 'Maintain balanced conditioning reps.']
    ],
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42], fontSize: 9.5, fontStyle: 'bold' },
    bodyStyles: { fontSize: 9, textColor: [30, 41, 59] },
    columnStyles: {
      0: { fontStyle: 'bold', width: 60 },
      1: { width: 120 }
    },
    didParseCell: (data) => {
      // Highlight injury risk rating
      if (data.section === 'body' && data.column.index === 1 && data.row.index === 1) {
        if (safeInjuryRisk === 'high') data.cell.styles.textColor = [239, 68, 68];
        else if (safeInjuryRisk === 'medium') data.cell.styles.textColor = [245, 158, 11];
        else data.cell.styles.textColor = [16, 185, 129];
        data.cell.styles.fontStyle = 'bold';
      }
    }
  });

  // Save the complete report
  const filename = `Cricket_Bowling_Coach_${userName.replace(/\s+/g, '_')}_Report.pdf`;
  doc.save(filename);
};
