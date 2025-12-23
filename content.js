// Función para formatear JSON
function formatJSON(jsonString) {
    try {
        // Limpiar el string: remover <br> tags y espacios extra
        let cleaned = jsonString
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/&nbsp;/g, ' ')
            .trim();

        // Parsear el JSON
        const parsed = JSON.parse(cleaned);

        // Formatear con indentación de 2 espacios
        return JSON.stringify(parsed, null, 2);
    } catch (e) {
        console.error('Error formateando JSON:', e);
        return jsonString; // Retornar original si hay error
    }
}

// Función para aplicar syntax highlighting similar a VS Code
function highlightJSON(jsonString) {
    const container = document.createElement('div');
    container.className = 'json-highlight-container';

    let html = '';
    let i = 0;
    const len = jsonString.length;

    while (i < len) {
        const char = jsonString[i];

        // Strings
        if (char === '"') {
            let stringEnd = i + 1;
            let escaped = false;
            while (stringEnd < len) {
                if (jsonString[stringEnd] === '\\' && !escaped) {
                    escaped = true;
                } else if (jsonString[stringEnd] === '"' && !escaped) {
                    break;
                } else {
                    escaped = false;
                }
                stringEnd++;
            }

            // Verificar si es una key (string seguido de ":")
            let isKey = false;
            let j = stringEnd + 1;
            // Saltar espacios y saltos de línea después del string
            while (j < len && (jsonString[j] === ' ' || jsonString[j] === '\n' || jsonString[j] === '\t' || jsonString[j] === '\r')) {
                j++;
            }
            // Si después viene ":", es una key
            if (j < len && jsonString[j] === ':') {
                isKey = true;
            }

            // Extraer el contenido del string (sin las comillas)
            const stringContent = jsonString.substring(i + 1, stringEnd);

            // Verificar si es una URL de imagen
            const isImageUrl = !isKey && isImageURL(stringContent);

            let className = isKey ? 'json-key' : 'json-string';
            if (isImageUrl) {
                className += ' json-image-url';
            }

            const stringHtml = escapeHtml(jsonString.substring(i, stringEnd + 1));
            if (isImageUrl) {
                html += '<span class="' + className + '" data-image-url="' + escapeHtml(stringContent) + '">' + stringHtml + '</span>';
            } else {
                html += '<span class="' + className + '">' + stringHtml + '</span>';
            }
            i = stringEnd + 1;
        }
        // Numbers
        else if ((char >= '0' && char <= '9') || (char === '-' && i + 1 < len && jsonString[i + 1] >= '0' && jsonString[i + 1] <= '9')) {
            let numEnd = i + 1;
            while (numEnd < len && ((jsonString[numEnd] >= '0' && jsonString[numEnd] <= '9') || jsonString[numEnd] === '.' || jsonString[numEnd] === 'e' || jsonString[numEnd] === 'E' || jsonString[numEnd] === '+' || jsonString[numEnd] === '-')) {
                numEnd++;
            }
            html += '<span class="json-number">' + escapeHtml(jsonString.substring(i, numEnd)) + '</span>';
            i = numEnd;
        }
        // Booleans y null
        else if (jsonString.substr(i, 4) === 'true' && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(jsonString[i + 4]))) {
            html += '<span class="json-boolean">true</span>';
            i += 4;
        }
        else if (jsonString.substr(i, 5) === 'false' && (i + 5 >= len || !/[a-zA-Z0-9_]/.test(jsonString[i + 5]))) {
            html += '<span class="json-boolean">false</span>';
            i += 5;
        }
        else if (jsonString.substr(i, 4) === 'null' && (i + 4 >= len || !/[a-zA-Z0-9_]/.test(jsonString[i + 4]))) {
            html += '<span class="json-null">null</span>';
            i += 4;
        }
        // Brackets (llaves)
        else if (char === '{' || char === '}') {
            html += '<span class="json-brace">' + escapeHtml(char) + '</span>';
            i++;
        }
        // Brackets (corchetes)
        else if (char === '[' || char === ']') {
            html += '<span class="json-bracket">' + escapeHtml(char) + '</span>';
            i++;
        }
        // Colon
        else if (char === ':') {
            html += '<span class="json-colon">' + escapeHtml(char) + '</span>';
            i++;
        }
        // Comma
        else if (char === ',') {
            html += '<span class="json-comma">' + escapeHtml(char) + '</span>';
            i++;
        }
        // Whitespace y otros caracteres
        else {
            html += escapeHtml(char);
            i++;
        }
    }

    container.innerHTML = html;
    return container;
}

// Función para escapar HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Función para verificar si una cadena es una URL de imagen
function isImageURL(str) {
    if (!str || typeof str !== 'string') return false;
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tiff|tif)(\?.*)?$/i;
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(str) && imageExtensions.test(str);
}

// Variable global para rastrear el modal en carga
let currentLoadingModal = null;
let currentLoadingUrl = null;

// Función para crear y mostrar el modal de imagen
function createImageModal(url) {
    // Si ya hay un modal cargando para esta URL, no crear otro
    if (currentLoadingModal && currentLoadingUrl === url) {
        return currentLoadingModal;
    }

    // Remover modal existente si hay uno
    const existingModal = document.getElementById('json-image-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'json-image-modal';
    modal.className = 'json-image-modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'json-image-modal-content';

    const img = document.createElement('img');
    img.className = 'json-image-modal-img';
    img.alt = 'Imagen';
    img.style.display = 'none'; // Ocultar inicialmente

    const placeholder = document.createElement('div');
    placeholder.className = 'json-image-placeholder';
    placeholder.innerHTML = '⏳';

    const errorMsg = document.createElement('div');
    errorMsg.className = 'json-image-error';
    errorMsg.textContent = 'Imagen no disponible';
    errorMsg.style.display = 'none';

    const dimensions = document.createElement('div');
    dimensions.className = 'json-image-dimensions';
    dimensions.style.display = 'none';

    // Cuando la imagen carga exitosamente
    img.onload = function () {
        const currentModal = document.getElementById('json-image-modal');
        if (!currentModal) return; // Si el modal fue removido, no hacer nada

        const currentPlaceholder = currentModal.querySelector('.json-image-placeholder');
        const currentErrorMsg = currentModal.querySelector('.json-image-error');
        const currentDimensions = currentModal.querySelector('.json-image-dimensions');
        const currentImg = currentModal.querySelector('.json-image-modal-img');

        if (currentPlaceholder) {
            currentPlaceholder.style.display = 'none';
        }
        if (currentErrorMsg) {
            currentErrorMsg.style.display = 'none';
        }
        if (currentDimensions) {
            currentDimensions.style.display = 'block';
            currentDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
        }
        if (currentImg) {
            currentImg.style.display = 'block';
        }

        // Restaurar cursor en todos los links de imagen
        document.querySelectorAll('.json-image-url').forEach(link => {
            link.style.cursor = 'pointer';
        });
        currentLoadingModal = null;
        currentLoadingUrl = null;
    };

    // Cuando la imagen falla al cargar
    img.onerror = function () {
        const currentModal = document.getElementById('json-image-modal');
        if (!currentModal) return; // Si el modal fue removido, no hacer nada

        const currentPlaceholder = currentModal.querySelector('.json-image-placeholder');
        const currentErrorMsg = currentModal.querySelector('.json-image-error');
        const currentDimensions = currentModal.querySelector('.json-image-dimensions');
        const currentImg = currentModal.querySelector('.json-image-modal-img');

        if (currentPlaceholder) {
            currentPlaceholder.innerHTML = '🖼️';
            currentPlaceholder.style.display = 'flex';
        }
        if (currentErrorMsg) {
            currentErrorMsg.style.display = 'block';
        }
        if (currentDimensions) {
            currentDimensions.style.display = 'none';
        }
        if (currentImg) {
            currentImg.style.display = 'none';
        }

        // Restaurar cursor en todos los links de imagen
        document.querySelectorAll('.json-image-url').forEach(link => {
            link.style.cursor = 'pointer';
        });
        currentLoadingModal = null;
        currentLoadingUrl = null;
    };

    modalContent.appendChild(placeholder);
    modalContent.appendChild(errorMsg);
    modalContent.appendChild(dimensions);
    modalContent.appendChild(img); // Agregar la imagen al DOM desde el inicio

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Cargar la imagen después de agregar al DOM
    img.src = url;

    // Marcar como modal en carga
    currentLoadingModal = modal;
    currentLoadingUrl = url;

    return modal;
}

// Función para remover el modal
function removeImageModal() {
    const modal = document.getElementById('json-image-modal');
    if (modal) {
        modal.remove();
        currentLoadingModal = null;
        currentLoadingUrl = null;
    }
}

// Función para posicionar el modal cerca del cursor
function positionModal(modal, x, y) {
    const modalContent = modal.querySelector('.json-image-modal-content');
    const rect = modalContent.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Offset del cursor
    const offsetX = 15;
    const offsetY = 15;

    let left = x + offsetX;
    let top = y + offsetY;

    // Ajustar si se sale por la derecha
    if (left + rect.width > viewportWidth) {
        left = x - rect.width - offsetX;
    }

    // Ajustar si se sale por abajo
    if (top + rect.height > viewportHeight) {
        top = y - rect.height - offsetY;
    }

    // Asegurar que no se salga por la izquierda o arriba
    left = Math.max(10, Math.min(left, viewportWidth - rect.width - 10));
    top = Math.max(10, Math.min(top, viewportHeight - rect.height - 10));

    modal.style.left = left + 'px';
    modal.style.top = top + 'px';
}

// Función para copiar al portapapeles
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // Fallback para navegadores más antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    }
}

// Función para procesar un span
function processSpan(span) {
    // Verificar si ya fue procesado
    if (span.dataset.jsonFormatted === 'true') {
        return;
    }

    // Obtener el HTML interno
    const innerHTML = span.innerHTML;

    // Verificar si contiene JSON (buscar llaves y estructura JSON)
    if (innerHTML.includes('{') && innerHTML.includes('"')) {
        try {
            // Extraer el texto y formatearlo
            const formattedJSON = formatJSON(innerHTML);

            // Crear contenedor principal
            const container = document.createElement('div');
            container.className = 'netsuite-json-container';

            // Crear botón de copiar
            const copyButton = document.createElement('button');
            copyButton.type = 'button'; // Evitar que se comporte como submit
            copyButton.className = 'json-copy-button';
            copyButton.innerHTML = '📋 Copiar';
            copyButton.title = 'Copiar JSON al portapapeles';
            copyButton.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const success = await copyToClipboard(formattedJSON);
                if (success) {
                    const originalText = copyButton.innerHTML;
                    copyButton.innerHTML = '✓ Copiado!';
                    copyButton.classList.add('copied');
                    setTimeout(() => {
                        copyButton.innerHTML = originalText;
                        copyButton.classList.remove('copied');
                    }, 2000);
                } else {
                    copyButton.innerHTML = '✗ Error';
                    setTimeout(() => {
                        copyButton.innerHTML = '📋 Copiar';
                    }, 2000);
                }
            });

            // Crear elemento pre con syntax highlighting
            const pre = document.createElement('pre');
            pre.className = 'netsuite-json-formatted';

            // Aplicar syntax highlighting
            const highlighted = highlightJSON(formattedJSON);
            pre.appendChild(highlighted);

            // Agregar event listeners para URLs de imágenes
            const imageUrls = highlighted.querySelectorAll('.json-image-url');
            imageUrls.forEach(imgSpan => {
                const imageUrl = imgSpan.getAttribute('data-image-url');
                if (imageUrl) {
                    let hideTimeout = null;
                    let isHovering = false;

                    const showModal = (e) => {
                        // Si ya hay un modal cargando para esta URL, solo actualizar posición
                        if (currentLoadingModal && currentLoadingUrl === imageUrl) {
                            positionModal(currentLoadingModal, e.clientX, e.clientY);
                            return;
                        }

                        if (hideTimeout) {
                            clearTimeout(hideTimeout);
                            hideTimeout = null;
                        }

                        // Cambiar cursor a loading
                        imgSpan.style.cursor = 'wait';

                        const modal = createImageModal(imageUrl);
                        // Posicionar el modal cerca del cursor
                        positionModal(modal, e.clientX, e.clientY);

                        // Agregar listeners al modal recién creado
                        modal.addEventListener('mouseenter', () => {
                            if (hideTimeout) {
                                clearTimeout(hideTimeout);
                                hideTimeout = null;
                            }
                        });

                        modal.addEventListener('mouseleave', () => {
                            hideTimeout = setTimeout(() => {
                                removeImageModal();
                                imgSpan.style.cursor = 'pointer';
                            }, 200);
                        });
                    };

                    const hideModal = () => {
                        hideTimeout = setTimeout(() => {
                            removeImageModal();
                            imgSpan.style.cursor = 'pointer';
                        }, 200);
                    };

                    imgSpan.addEventListener('mouseenter', (e) => {
                        isHovering = true;
                        showModal(e);
                    });

                    imgSpan.addEventListener('mousemove', (e) => {
                        if (isHovering) {
                            const modal = document.getElementById('json-image-modal');
                            if (modal) {
                                positionModal(modal, e.clientX, e.clientY);
                            } else {
                                // Si no hay modal pero estamos sobre el link, crear uno
                                showModal(e);
                            }
                        }
                    });

                    imgSpan.addEventListener('mouseleave', () => {
                        isHovering = false;
                        hideModal();
                    });

                    // Agregar click para abrir en nueva pestaña
                    imgSpan.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(imageUrl, '_blank', 'noopener,noreferrer');
                    });
                }
            });

            // Agregar elementos al contenedor
            container.appendChild(copyButton);
            container.appendChild(pre);

            // Limpiar el span y agregar el contenedor
            span.innerHTML = '';
            span.appendChild(container);
            span.style.display = 'block';
            span.style.padding = '4px';

            // Marcar como procesado
            span.dataset.jsonFormatted = 'true';
        } catch (e) {
            console.error('Error procesando span:', e);
        }
    }
}

// Función para buscar y procesar todos los spans relevantes
function processAllSpans() {
    // Buscar spans con las clases específicas de NetSuite
    const selector = 'span.uir-field.inputreadonly.uir-resizable[data-nsps-type="field_input"][data-field-type="textarea"]';
    const spans = document.querySelectorAll(selector);

    spans.forEach(span => {
        processSpan(span);
    });
}

// Observador de mutaciones para detectar nuevos elementos dinámicos
const observer = new MutationObserver((mutations) => {
    let shouldProcess = false;

    mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) { // Element node
                    // Verificar si el nodo agregado es un span relevante o contiene uno
                    if (node.matches && node.matches('span.uir-field.inputreadonly.uir-resizable[data-nsps-type="field_input"][data-field-type="textarea"]')) {
                        shouldProcess = true;
                    } else if (node.querySelectorAll) {
                        const relevantSpans = node.querySelectorAll('span.uir-field.inputreadonly.uir-resizable[data-nsps-type="field_input"][data-field-type="textarea"]');
                        if (relevantSpans.length > 0) {
                            shouldProcess = true;
                        }
                    }
                }
            });
        }
    });

    if (shouldProcess) {
        // Usar setTimeout para evitar procesar demasiado frecuentemente
        setTimeout(processAllSpans, 100);
    }
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        processAllSpans();
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
} else {
    processAllSpans();
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

