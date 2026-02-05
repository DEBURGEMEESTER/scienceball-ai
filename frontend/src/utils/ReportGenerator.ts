import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generatePlayerReport = async (elementId: string, playerName: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            backgroundColor: '#05070a',
            scale: 2,
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`ScienceBall_Intelligence_Report_${playerName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("PDF Generation failed:", error);
    }
};
