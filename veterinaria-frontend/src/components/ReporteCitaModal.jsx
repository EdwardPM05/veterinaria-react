// frontend/src/components/ReporteCitaModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FaTimes, FaFilePdf, FaSyncAlt } from 'react-icons/fa';
import jsPDF from 'jspdf';
// Importa el logo directamente para asegurar que Webpack lo empaquete y lo haga accesible
import logo from '../assets/images/logo.png'; // Asegúrate de que esta ruta sea correcta

const API_CITAS_URL = 'http://localhost:3001/api/citas';
const API_REPORTE_URL = 'http://localhost:3001/api/citaservicios/reporte';

const ReporteCitaModal = ({ isOpen, onClose }) => {
    const [allCitas, setAllCitas] = useState([]);
    const [selectedCitaId, setSelectedCitaId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loadingCitas, setLoadingCitas] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [errorCitas, setErrorCitas] = useState(null);
    const [errorReport, setErrorReport] = useState(null);

    const fetchAllCitas = useCallback(async () => {
        setLoadingCitas(true);
        setErrorCitas(null);
        try {
            const response = await axios.get(API_CITAS_URL);
            setAllCitas(response.data);
        } catch (err) {
            console.error("Error al obtener citas para el reporte:", err);
            setErrorCitas("No se pudieron cargar las citas.");
        } finally {
            setLoadingCitas(false);
        }
    }, []);

    const fetchReportData = useCallback(async (citaId) => {
        setLoadingReport(true);
        setErrorReport(null);
        try {
            const response = await axios.get(`${API_REPORTE_URL}/${citaId}`);
            setReportData(response.data);
        } catch (err) {
            console.error("Error al obtener datos del reporte:", err);
            if (err.response && err.response.status === 404) {
                setErrorReport("No se encontraron datos para la cita seleccionada o no tiene servicios.");
            } else {
                setErrorReport("Error al cargar los datos del reporte.");
            }
            setReportData(null);
        } finally {
            setLoadingReport(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchAllCitas();
            setSelectedCitaId('');
            setReportData(null);
            setErrorReport(null);
        }
    }, [isOpen, fetchAllCitas]);

    useEffect(() => {
        if (selectedCitaId) {
            fetchReportData(selectedCitaId);
        } else {
            setReportData(null);
            setErrorReport(null);
        }
    }, [selectedCitaId, fetchReportData]);

    const handleCitaSelectChange = (e) => {
        setSelectedCitaId(e.target.value);
    };

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        if (isNaN(date.getTime())) return 'Fecha inválida';
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ==========================================================
    // LÓGICA DE GENERACIÓN DE PDF (MODIFICADA y MEJORADA)
    // ==========================================================
    const generatePdf = () => {
        if (!reportData) {
            alert("No hay datos de reporte para generar el PDF.");
            return;
        }

        const doc = new jsPDF();
        let yPos = 15; // Posición Y inicial para el contenido
        const leftMargin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const rightMargin = pageWidth - 15;
        const sectionSpacing = 12; // Espacio entre secciones principales
        const lineSpacing = 6;    // Espacio entre líneas de texto en una sección

        // Colores y Fuentes
        const primaryColor = '#2E74B5'; // Azul similar al que usas
        const secondaryColor = '#E0F2F7'; // Azul muy claro para fondos de sección
        const textColor = '#333333'; // Gris oscuro para texto general
        const headingColor = '#000000'; // Negro para títulos de sección
        const accentColor = '#2E74B5'; // Azul para el total
        const borderColor = '#CCCCCC'; // Gris claro para bordes

        doc.setFont('helvetica'); // Fuente por defecto

        // Función para añadir el pie de página
        const addPageFooter = () => {
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(10);
                doc.setTextColor(100);
                doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }
        };

        // Función para dibujar encabezados de tabla si hay un salto de página
        const drawTableHeaders = (currentY) => {
            doc.setFontSize(12);
            doc.setFillColor(primaryColor); // Azul oscuro
            doc.setTextColor(255); // Blanco
            const tableWidth = pageWidth - (leftMargin * 2);
            const serviceColWidth = 50;
            const priceColWidth = 30;
            const descriptionColWidth = tableWidth - serviceColWidth - priceColWidth;

            doc.rect(leftMargin, currentY, tableWidth, 10, 'F'); // Dibujar el fondo del encabezado
            doc.text('Servicio', leftMargin + 3, currentY + 7);
            doc.text('Descripción', leftMargin + serviceColWidth + 5, currentY + 7);
            doc.text('Precio', rightMargin - 3, currentY + 7, { align: 'right' });
            doc.setTextColor(textColor); // Volver al color de texto general
            return currentY + 10;
        };


        // Cargar y añadir el logo
        const img = new Image();
        img.src = logo; // Ruta al logo importado
        img.onload = () => {
            doc.addImage(img, 'PNG', leftMargin, yPos, 30, 30); // x, y, width, height
            
            // Título del Reporte
            doc.setFontSize(26); // Más grande para el título
            doc.setTextColor(primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.setFont('helvetica', 'normal'); // Reset font style
            yPos += 25;

            // Fecha de Emisión
            doc.setFontSize(10);
            doc.setTextColor(textColor);
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, rightMargin, yPos, { align: 'right' });
            yPos += 5; // Espacio después de la fecha

            // Línea divisoria bajo el encabezado
            doc.setDrawColor(primaryColor);
            doc.setLineWidth(0.5);
            doc.line(leftMargin, yPos, rightMargin, yPos);
            yPos += sectionSpacing; // Espacio después de la línea divisoria

            // Función para dibujar una sección genérica
            const drawSection = (title, dataFields) => {
                const startY = yPos;
                doc.setFillColor(secondaryColor); // Fondo azul claro para la sección
                doc.rect(leftMargin, startY, pageWidth - (leftMargin * 2), 7 + (dataFields.length * lineSpacing) + 5, 'F'); // Dibujar fondo

                doc.setFontSize(14);
                doc.setTextColor(headingColor);
                doc.setFont('helvetica', 'bold');
                doc.text(title, leftMargin + 5, startY + 7); // Título de la sección
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(textColor);

                yPos += 7 + 2; // Espacio después del título de sección

                dataFields.forEach(field => {
                    doc.setFontSize(12);
                    doc.text(`${field.label}: ${field.value}`, leftMargin + 5, yPos + lineSpacing);
                    yPos += lineSpacing;
                });
                doc.setDrawColor(primaryColor); // Borde de la sección
                doc.setLineWidth(0.3);
                doc.rect(leftMargin, startY, pageWidth - (leftMargin * 2), yPos - startY + 5, 'S'); // Dibujar borde
                yPos += sectionSpacing;
            };

            // Información del Cliente
            drawSection('Datos del Cliente:', [
                { label: 'Nombre Completo', value: `${String(reportData.Cliente.PrimerNombre || '')} ${String(reportData.Cliente.ApellidoPaterno || '')} ${String(reportData.Cliente.ApellidoMaterno || '')}`.trim() },
                { label: 'DNI', value: String(reportData.Cliente.DNI || 'N/A') },
                { label: 'Teléfono', value: String(reportData.Cliente.Telefono || 'N/A') },
                { label: 'Dirección', value: String(reportData.Cliente.Direccion || 'N/A') },
                { label: 'Correo', value: String(reportData.Cliente.Correo || 'N/A') }
            ]);

            // Información de la Mascota
            drawSection('Datos de la Mascota:', [
                { label: 'Nombre', value: String(reportData.Mascota.Nombre || 'N/A') },
                { label: 'Especie', value: String(reportData.Mascota.Especie || 'N/A') },
                { label: 'Raza', value: String(reportData.Mascota.Raza || 'N/A') },
                { label: 'Edad', value: `${String(reportData.Mascota.Edad || 'N/A')} años` },
                { label: 'Sexo', value: String(reportData.Mascota.Sexo === 'M' ? 'Macho' : 'Hembra' || 'N/A') }
            ]);

            // Información de la Cita
            drawSection('Detalles de la Cita:', [
                { label: 'Fecha y Hora', value: formatDateTime(reportData.Fecha) },
                { label: 'Estado', value: String(reportData.Estado || 'N/A') },
                { label: 'Atendido por', value: `${String(reportData.Empleado.PrimerNombre || '')} ${String(reportData.Empleado.ApellidoPaterno || '')} (${String(reportData.Empleado.Rol || 'N/A')})`.trim() }
            ]);
            
            // Encabezados de la tabla de Servicios
            yPos = drawTableHeaders(yPos);
            doc.setFontSize(10);

            // Contenido de la tabla de Servicios
            const tableWidth = pageWidth - (leftMargin * 2);
            const serviceColWidth = 50;
            const priceColWidth = 30;
            const descriptionColWidth = tableWidth - serviceColWidth - priceColWidth;

            reportData.Servicios.forEach(s => {
                let currentY = yPos;

                const serviceName = String(s.Nombre || 'N/A');
                const serviceDesc = String(s.Descripcion || 'N/A');
                const servicePrice = `S/. ${parseFloat(s.Precio || 0).toFixed(2)}`;

                // Dividir descripción si es muy larga
                const splitDescription = doc.splitTextToSize(serviceDesc, descriptionColWidth - 5);
                const descLineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
                const requiredHeight = Math.max(10, splitDescription.length * descLineHeight + 4); // Altura mínima de fila, con padding

                // Verificar si el contenido excede la página, agregar una nueva página
                if (currentY + requiredHeight > doc.internal.pageSize.height - 30) {
                    doc.addPage();
                    yPos = 20; // Resetear Y para la nueva página
                    currentY = drawTableHeaders(yPos); // Redibujar encabezados
                    doc.setFontSize(10);
                }

                // Dibujar borde de la fila (rectángulo)
                doc.setDrawColor(borderColor); // Color del borde
                doc.setLineWidth(0.1);
                doc.rect(leftMargin, currentY, tableWidth, requiredHeight, 'S');

                doc.setTextColor(textColor);

                // Dibujar texto del servicio (alineado a la izquierda)
                doc.text(serviceName, leftMargin + 3, currentY + requiredHeight / 2 + (doc.getTextDimensions(serviceName).h / 4));

                // Dibujar texto de la descripción (puede ser multilínea)
                doc.text(splitDescription, leftMargin + serviceColWidth + 5, currentY + (requiredHeight - splitDescription.length * descLineHeight) / 2 + descLineHeight);

                // Dibujar texto del precio (alineado a la derecha)
                doc.text(servicePrice, rightMargin - 3, currentY + requiredHeight / 2 + (doc.getTextDimensions(servicePrice).h / 4), { align: 'right' });

                yPos = currentY + requiredHeight; // Actualizar yPos para la siguiente fila
            });

            // Total a pagar
            yPos += 10;
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accentColor); // Color de acento para el total
            doc.text(`TOTAL A PAGAR: S/. ${reportData.TotalPagar.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
            doc.setFont('helvetica', 'normal'); // Reset font style

            // Añadir pie de página a todas las páginas
            addPageFooter();

            doc.save(`reporte_cita_${reportData.CitaID}.pdf`);
        };

        // Manejo de error si la imagen no carga
        img.onerror = () => {
            console.error("Error al cargar la imagen del logo. Generando PDF sin logo.");
            // Generar el PDF sin el logo si hay un error de carga
            doc.setFontSize(26);
            doc.setTextColor(primaryColor);
            doc.setFont('helvetica', 'bold');
            doc.text('REPORTE DE SERVICIOS DE CITA', pageWidth / 2, yPos + 10, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            yPos += 25;

            doc.setFontSize(10);
            doc.setTextColor(textColor);
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, rightMargin, yPos, { align: 'right' });
            yPos += 5;

            doc.setDrawColor(primaryColor);
            doc.setLineWidth(0.5);
            doc.line(leftMargin, yPos, rightMargin, yPos);
            yPos += sectionSpacing;

            // Función para dibujar una sección genérica (repetida por simplicidad, podrías refactorizar)
            const drawSectionOnError = (title, dataFields) => {
                const startY = yPos;
                doc.setFillColor(secondaryColor);
                doc.rect(leftMargin, startY, pageWidth - (leftMargin * 2), 7 + (dataFields.length * lineSpacing) + 5, 'F');

                doc.setFontSize(14);
                doc.setTextColor(headingColor);
                doc.setFont('helvetica', 'bold');
                doc.text(title, leftMargin + 5, startY + 7);
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(textColor);

                yPos += 7 + 2;

                dataFields.forEach(field => {
                    doc.setFontSize(12);
                    doc.text(`${field.label}: ${field.value}`, leftMargin + 5, yPos + lineSpacing);
                    yPos += lineSpacing;
                });
                doc.setDrawColor(primaryColor);
                doc.setLineWidth(0.3);
                doc.rect(leftMargin, startY, pageWidth - (leftMargin * 2), yPos - startY + 5, 'S');
                yPos += sectionSpacing;
            };

            // Cliente
            drawSectionOnError('Datos del Cliente:', [
                { label: 'Nombre Completo', value: `${String(reportData.Cliente.PrimerNombre || '')} ${String(reportData.Cliente.ApellidoPaterno || '')} ${String(reportData.Cliente.ApellidoMaterno || '')}`.trim() },
                { label: 'DNI', value: String(reportData.Cliente.DNI || 'N/A') },
                { label: 'Teléfono', value: String(reportData.Cliente.Telefono || 'N/A') },
                { label: 'Dirección', value: String(reportData.Cliente.Direccion || 'N/A') },
                { label: 'Correo', value: String(reportData.Cliente.Correo || 'N/A') }
            ]);

            // Mascota
            drawSectionOnError('Datos de la Mascota:', [
                { label: 'Nombre', value: String(reportData.Mascota.Nombre || 'N/A') },
                { label: 'Especie', value: String(reportData.Mascota.Especie || 'N/A') },
                { label: 'Raza', value: String(reportData.Mascota.Raza || 'N/A') },
                { label: 'Edad', value: `${String(reportData.Mascota.Edad || 'N/A')} años` },
                { label: 'Sexo', value: String(reportData.Mascota.Sexo === 'M' ? 'Macho' : 'Hembra' || 'N/A') }
            ]);

            // Cita
            drawSectionOnError('Detalles de la Cita:', [
                { label: 'ID Cita', value: String(reportData.CitaID || 'N/A') },
                { label: 'Fecha y Hora', value: formatDateTime(reportData.Fecha) },
                { label: 'Estado', value: String(reportData.Estado || 'N/A') },
                { label: 'Atendido por', value: `${String(reportData.Empleado.PrimerNombre || '')} ${String(reportData.Empleado.ApellidoPaterno || '')} (${String(reportData.Empleado.Rol || 'N/A')})`.trim() }
            ]);

            yPos = drawTableHeaders(yPos);
            doc.setFontSize(10);

            const tableWidthOnError = pageWidth - (leftMargin * 2);
            const serviceColWidthOnError = 50;
            const priceColWidthOnError = 30;
            const descriptionColWidthOnError = tableWidthOnError - serviceColWidthOnError - priceColWidthOnError;

            reportData.Servicios.forEach(s => {
                let currentY = yPos;

                const serviceName = String(s.Nombre || 'N/A');
                const serviceDesc = String(s.Descripcion || 'N/A');
                const servicePrice = `S/. ${parseFloat(s.Precio || 0).toFixed(2)}`;

                const splitDescription = doc.splitTextToSize(serviceDesc, descriptionColWidthOnError - 5);
                const descLineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
                const requiredHeight = Math.max(10, splitDescription.length * descLineHeight + 4);

                if (currentY + requiredHeight > doc.internal.pageSize.height - 30) {
                    doc.addPage();
                    yPos = 20;
                    currentY = drawTableHeaders(yPos);
                    doc.setFontSize(10);
                }

                doc.setDrawColor(borderColor);
                doc.setLineWidth(0.1);
                doc.rect(leftMargin, currentY, tableWidthOnError, requiredHeight, 'S');

                doc.setTextColor(textColor);
                doc.text(serviceName, leftMargin + 3, currentY + requiredHeight / 2 + (doc.getTextDimensions(serviceName).h / 4));
                doc.text(splitDescription, leftMargin + serviceColWidthOnError + 5, currentY + (requiredHeight - splitDescription.length * descLineHeight) / 2 + descLineHeight);
                doc.text(servicePrice, rightMargin - 3, currentY + requiredHeight / 2 + (doc.getTextDimensions(servicePrice).h / 4), { align: 'right' });

                yPos = currentY + requiredHeight;
            });

            yPos += 10;
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(accentColor);
            doc.text(`TOTAL A PAGAR: S/. ${reportData.TotalPagar.toFixed(2)}`, rightMargin, yPos, { align: 'right' });
            doc.setFont('helvetica', 'normal');

            addPageFooter();
            doc.save(`reporte_cita_${reportData.CitaID}.pdf`);
        };
    };

    if (!isOpen) return null;

    return (
        <div 
        className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // <-- Añade esto para probar
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-3xl font-extrabold text-gray-800 flex-1 text-center">Generar Reporte de Cita</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 transition duration-200 absolute top-4 right-4"
                        aria-label="Cerrar modal"
                    >
                        <FaTimes className="text-2xl" />
                    </button>
                </div>

                {loadingCitas ? (
                    <div className="text-center text-gray-600 py-8 flex items-center justify-center">
                        <FaSyncAlt className="animate-spin mr-2" /> Cargando citas...
                    </div>
                ) : errorCitas ? (
                    <div className="text-center text-red-500 py-8">{errorCitas}</div>
                ) : (
                    <div className="mb-6">
                        <label htmlFor="selectCita" className="block text-gray-700 text-lg font-semibold mb-3">
                            Selecciona una Cita para el Reporte:
                        </label>
                        <div className="relative border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                            <select
                                id="selectCita"
                                value={selectedCitaId}
                                onChange={handleCitaSelectChange}
                                className="w-full p-3 bg-white text-gray-700 rounded-lg appearance-none outline-none cursor-pointer"
                            >
                                <option value="">Seleccionar Cita</option>
                                {allCitas.map(cita => (
                                    <option key={cita.CitaID} value={cita.CitaID}>
                                        {formatDateTime(cita.Fecha)} - {cita.MascotaNombre} ({cita.ClientePrimerNombre} {cita.ClienteApellidoPaterno})
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>
                )}

                {selectedCitaId && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                        {loadingReport ? (
                            <div className="text-center text-gray-600 py-8 flex items-center justify-center">
                                <FaSyncAlt className="animate-spin mr-2" /> Cargando datos del reporte...
                            </div>
                        ) : errorReport ? (
                            <div className="text-center text-red-500 py-8">{errorReport}</div>
                        ) : reportData ? (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Resumen del Reporte</h3>
                                <div className="bg-blue-50 p-4 rounded-lg mb-4 shadow-sm">
                                    <p className="text-lg font-semibold text-blue-800">Cita: {formatDateTime(reportData.Fecha)}</p>
                                    <p className="text-gray-700">Mascota: <span className="font-medium">{reportData.Mascota.Nombre}</span> (Cliente: <span className="font-medium">{reportData.Cliente.PrimerNombre} {reportData.Cliente.ApellidoPaterno}</span>)</p>
                                    <p className="text-gray-700">Estado de Cita: <span className="font-medium">{reportData.Estado}</span></p>
                                    <p className="text-lg font-bold text-blue-900 mt-2">Total a Pagar: S/. {reportData.TotalPagar.toFixed(2)}</p>
                                </div>

                                {reportData.Servicios.length > 0 ? (
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-2">Servicios Incluidos:</h4>
                                        <ul className="list-disc list-inside text-gray-600">
                                            {reportData.Servicios.map(s => (
                                                <li key={s.ID}>{s.Nombre} - S/. {s.Precio.toFixed(2)}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">No hay servicios asociados a esta cita.</div>
                                )}

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        onClick={generatePdf}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-lg transition duration-200 flex items-center shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <FaFilePdf className="mr-2" /> Generar PDF
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-lg transition duration-200 flex items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                                    >
                                        <FaTimes className="mr-2" /> Cerrar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                Selecciona una cita para ver el resumen del reporte.
                            </div>
                        )}
                    </div>
                )}

                {!selectedCitaId && !loadingCitas && !errorCitas && (
                    <div className="text-center text-gray-500 py-8">
                        Por favor, selecciona una cita del desplegable para generar un reporte.
                    </div>
                )}

            </div>
        </div>
    );
};

export default ReporteCitaModal;