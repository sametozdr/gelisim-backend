const PDFDocument = require('pdfkit');

/**
 * Generates a Session Report PDF
 * @param {Object} data - { date, appointments }
 * @param {Stream} res - Express response stream
 */
exports.generateDailyReport = (data, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // Stream PDF to response
  doc.pipe(res);

  // Header
  doc
    .fontSize(20)
    .text('GELİŞİM ERP - GÜNLÜK SEANS RAPORU', { align: 'center' })
    .moveDown();

  doc
    .fontSize(12)
    .text(`Rapor Tarihi: ${data.date}`, { align: 'right' })
    .moveDown();

  // Table (Simplified)
  const tableTop = 150;
  doc.font('Helvetica-Bold').text('Saat', 50, tableTop);
  doc.text('Danışan', 120, tableTop);
  doc.text('Uzman', 250, tableTop);
  doc.text('Oda', 400, tableTop);
  doc.text('Durum', 500, tableTop);

  doc.moveDown();
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let position = tableTop + 30;
  doc.font('Helvetica');

  data.appointments.forEach((apt) => {
    const time = new Date(apt.start_time).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    doc.text(time, 50, position);
    doc.text(apt.client.full_name, 120, position);
    doc.text(apt.consultant.full_name, 250, position);
    doc.text(apt.room.name, 400, position);
    doc.text(apt.status, 500, position);

    position += 20;

    if (position > 700) {
      doc.addPage();
      position = 50;
    }
  });

  // Footer
  doc
    .fontSize(10)
    .text('Mental Destek ve Eğitim Danışmanlığı Merkezi Otomatik Raporu', 50, 750, { align: 'center', width: 500 });

  doc.end();
};
