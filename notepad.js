document.addEventListener("DOMContentLoaded", function () {
    const noteForm = document.getElementById("noteForm");
    const noteTitle = document.getElementById("noteTitle");
    const noteDescription = document.getElementById("noteDescription");
    const noteCategory = document.getElementById("noteCategory");
    const notesTableBody = document.querySelector("#notesTable tbody");
    const notesTableWrapper = document.getElementById("notesTableWrapper");
    const notesContainer = document.getElementById("notesContainer");
    const clearNotesBtn = document.getElementById("clearNotes");
    const exportNotesBtn = document.getElementById("exportNotes");
    const categoryButtons = document.getElementById("categoryButtons");
    const paginationContainer = document.getElementById("pagination");
    const submitButton = noteForm.querySelector("button[type='submit']");

    let notes = JSON.parse(localStorage.getItem("notes")) || [];
    let currentPage = 1;
    const notesPerPage = 5;
    let currentFilter = "Todas";
    let editingIndex = null;

    function saveNotes() {
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function showTableIfNeeded() {
        if (notes.length > 0) {
            notesContainer.style.display = "block";
            notesTableWrapper.style.display = "block";
            clearNotesBtn.style.display = "inline-block";
            exportNotesBtn.style.display = "inline-block";
            categoryButtons.style.display = "flex";
        } else {
            notesContainer.style.display = "none";
            notesTableWrapper.style.display = "none";
            clearNotesBtn.style.display = "none";
            exportNotesBtn.style.display = "none";
            categoryButtons.style.display = "none";
        }
    }

    function renderNotes() {
        const filteredNotes = currentFilter === "Todas" ? notes : notes.filter(note => note.category === currentFilter);
        const startIndex = (currentPage - 1) * notesPerPage;
        const paginatedNotes = filteredNotes.slice(startIndex, startIndex + notesPerPage);

        notesTableBody.innerHTML = "";

        paginatedNotes.forEach((note, index) => {
            const row = document.createElement("tr");
            const fecha = new Date(note.date).toLocaleString();

            const globalIndex = notes.indexOf(note);

            row.innerHTML = `
                <td style="white-space: nowrap; width: 150px;">${fecha}</td>
                <td>${note.title}</td>
                <td>
                    ${note.description.slice(0, 30)}...
                    <br>
                    <button class="btn btn-sm btn-link text-decoration-none p-0" data-action="toggle" data-index="${globalIndex}">🔍 Ver más</button>
                    <div class="text-muted small mt-1" style="display:none;" id="full-desc-${globalIndex}">${note.description}</div>
                </td>
                <td style="width: 250px;">
                    <div class="d-flex justify-content-start gap-2">
                        <button class="btn btn-sm btn-warning flex-fill" style="min-width: 100px;" data-action="edit" data-index="${globalIndex}">✏️ Editar</button>
                        <button class="btn btn-sm btn-danger flex-fill" style="min-width: 100px;" data-action="delete" data-index="${globalIndex}">🗑 Eliminar</button>
                    </div>
                </td>
            `;

            notesTableBody.appendChild(row);
        });

        renderPagination(filteredNotes.length);
        showTableIfNeeded();
    }

    function renderPagination(totalNotes) {
        const totalPages = Math.ceil(totalNotes / notesPerPage);
        paginationContainer.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement("button");
            btn.className = `btn btn-sm btn-outline-primary mx-1 ${i === currentPage ? "active" : ""}`;
            btn.textContent = i;
            btn.addEventListener("click", () => {
                currentPage = i;
                renderNotes();
            });
            paginationContainer.appendChild(btn);
        }
    }

    noteForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!noteTitle.value.trim() || !noteDescription.value.trim() || !noteCategory.value) {
            Swal.fire("Oops...", "Todos los campos son obligatorios", "warning");
            return;
        }

        const note = {
            title: noteTitle.value.trim(),
            description: noteDescription.value.trim(),
            category: noteCategory.value,
            date: new Date().toISOString()
        };

        if (editingIndex !== null) {
            notes[editingIndex] = note;
            editingIndex = null;
            submitButton.textContent = "Agregar Nota";
            Swal.fire("Actualizado", "Nota actualizada con éxito", "success");
        } else {
            notes.unshift(note);
            Swal.fire("¡Hecho!", "Nota agregada exitosamente", "success");
        }

        saveNotes();
        noteForm.reset();
        currentPage = 1;
        renderNotes();
    });

    notesTableBody.addEventListener("click", function (e) {
        const target = e.target;
        const index = parseInt(target.dataset.index);

        if (target.dataset.action === "delete") {
            notes.splice(index, 1);
            saveNotes();
            renderNotes();
        }

        if (target.dataset.action === "toggle") {
            const descDiv = document.getElementById(`full-desc-${index}`);
            descDiv.style.display = descDiv.style.display === "none" ? "block" : "none";
        }

        if (target.dataset.action === "edit") {
            const note = notes[index];
            noteTitle.value = note.title;
            noteDescription.value = note.description;
            noteCategory.value = note.category;
            editingIndex = index;
            submitButton.textContent = "Actualizar Nota";
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    document.querySelectorAll("#categoryButtons button").forEach(btn => {
        btn.addEventListener("click", () => {
            currentFilter = btn.dataset.category;
            currentPage = 1;
            renderNotes();
        });
    });

    clearNotesBtn.addEventListener("click", () => {
        Swal.fire({
            title: "¿Estás segura?",
            text: "¡Esto eliminará todas tus notas!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, borrar",
            cancelButtonText: "Cancelar"
        }).then(result => {
            if (result.isConfirmed) {
                notes = [];
                saveNotes();
                renderNotes();
                Swal.fire("Borradas", "Todas las notas han sido eliminadas.", "success");
            }
        });
    });

    document.getElementById("exportNotes").addEventListener("click", () => {
        const notes = JSON.parse(localStorage.getItem("notes")) || [];
    
        if (notes.length === 0) {
            Swal.fire("No hay notas para exportar.");
            return;
        }
    
        const now = new Date();
        const formattedNow = now.toLocaleString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        });
    
        let content = `Notas exportadas el ${formattedNow}\n==============================\n\n`;
    
        content += notes.map(note => {
            const date = new Date(note.date);
            const formattedDate = date.toLocaleString("es-CO", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
    
            return `Título: ${note.title}
    Contenido: ${note.description}
    Categoría: ${note.category}
    Fecha: ${formattedDate}
    -----------------------------`;
        }).join("\n\n");
    
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
    
        const link = document.createElement("a");
        link.href = url;
        link.download = "notas.txt";
        link.click();
    
        URL.revokeObjectURL(url);
    });
    

    renderNotes();
});

