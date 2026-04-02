 const selectPaquete = document.getElementById('paqueteSelect');

        fetch('http://localhost/api/paquetes/getAll.php', {
            method: 'GET'
        })
            .then(res => res.json())
            .then(data => {

                // Limpia el select excepto la primera opción
                selectPaquete.innerHTML = '<option value="">Selecciona un destino</option>';

                data.forEach(paquete => {

                    const option = document.createElement('option');
                    option.value = paquete.id;
                    option.textContent = paquete.nombre;
                    // Si quieres mostrar precio:
                    // option.textContent = `${paquete.nombre} - $${paquete.precio}`;

                    selectPaquete.appendChild(option);
                });

            })
            .catch(err => console.error('Error cargando paquetes:', err));



        const reserva_form = document.getElementById('reserva-form');
        reserva_form.addEventListener('submit', (e) => {
            const formData = new FormData(reserva_form);

            const data = {
                usuario_id: 1, // mejor si viene de sesión en backend
                paquete_id: formData.get('paquete_id'),
                fecha_viaje: formData.get('fecha_viaje'),
                numero_personas: formData.get('numero_personas'),
                precio_total: formData.get('precio_total'),
                estado: formData.get('estado'),
                notas: formData.get('notas')
            };


            fetch('http://localhost/api/reservas.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(data => console.log(data))
                .catch(err => console.error(err));
        });



        // Menú hamburguesa
        function toggleMenu() {
            document.querySelector('nav ul').classList.toggle('active');
        }

        // Observador para animaciones
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.15, rootMargin: "0px 0px -80px 0px" });

        document.querySelectorAll('.fade-in, .card, .testimonial, h2').forEach(el => observer.observe(el));

        // Filtros y Buscador de Destinos
        function filterDestinos() {
            const search = document.getElementById('search-input').value.toLowerCase();
            const type = document.getElementById('type-filter').value;
            const price = document.getElementById('price-filter').value;
            const duration = document.getElementById('duration-filter').value;

            document.querySelectorAll('.destinos .card').forEach(card => {
                const name = card.dataset.name.toLowerCase();
                const cardType = card.dataset.type;
                const cardPrice = parseInt(card.dataset.price);
                const cardDuration = parseInt(card.dataset.duration);

                let show = true;

                if (search && !name.includes(search)) show = false;
                if (type && type !== cardType) show = false;
                if (price && cardPrice > parseInt(price)) show = false;
                if (duration && cardDuration > parseInt(duration)) show = false;

                card.classList.toggle('hidden', !show);
            });
        }

        // Favoritos con localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

        function toggleFavorite(btn, id) {
            const index = favorites.indexOf(id);
            if (index > -1) {
                favorites.splice(index, 1);
                btn.classList.remove('favorited');
            } else {
                favorites.push(id);
                btn.classList.add('favorited');
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            loadFavorites();
        }

        // Cargar favoritos iniciales en botones
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const id = btn.parentElement.dataset.name.toLowerCase().replace(/\s/g, '');
            if (favorites.includes(id)) btn.classList.add('favorited');
        });

        // Cargar sección favoritos
        function loadFavorites() {
            const list = document.getElementById('favoritos-list');
            list.innerHTML = '';
            favorites.forEach(id => {
                const originalCard = document.querySelector(`.card[data-name="${id.charAt(0).toUpperCase() + id.slice(1)}"]`);
                if (originalCard) {
                    const clone = originalCard.cloneNode(true);
                    clone.querySelector('.favorite-btn').onclick = () => toggleFavorite(clone.querySelector('.favorite-btn'), id);
                    list.appendChild(clone);
                }
            });
        }
        loadFavorites();

        // Formularios (simulación de envío)
        document.getElementById('reserva-form').addEventListener('submit', e => {
            e.preventDefault();
            alert('¡Reserva enviada! Te contactaremos pronto para confirmar detalles.');
        });

        document.getElementById('contacto-form').addEventListener('submit', e => {
            e.preventDefault();
            alert('¡Mensaje enviado! Responderemos en breve.');
        });