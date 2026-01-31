        // Global Variables
        let projectsData = [];
        let nextProjectId = 1;
        let revenueChart, projectDistChart, clientTrendChart, projectStatusChart;
        let updateInterval;

        // Page Loader
        window.addEventListener('load', function () {
            setTimeout(() => {
                document.querySelector('.page-loader').classList.add('hide');
            }, 800);
        });

        // Initialize data from localStorage
        function initializeData() {
            const savedData = localStorage.getItem('projectsData');
            if (savedData) {
                projectsData = JSON.parse(savedData);
                if (projectsData.length > 0) {
                    nextProjectId = Math.max(...projectsData.map(p => p.id)) + 1;
                }
            } else {
                projectsData = [
                    { id: 1, client: 'PT. Digital Indonesia', project: 'E-Commerce Platform', status: 'progress', budget: 45000000, progress: 65, deadline: '2024-02-15', description: 'Platform e-commerce lengkap dengan payment gateway' },
                    { id: 2, client: 'CV. Maju Jaya', project: 'Company Profile', status: 'progress', budget: 12000000, progress: 80, deadline: '2024-01-28', description: 'Website company profile modern dan responsive' },
                    { id: 3, client: 'Startup XYZ', project: 'Mobile App', status: 'pending', budget: 85000000, progress: 20, deadline: '2024-03-10', description: 'Aplikasi mobile untuk iOS dan Android' },
                    { id: 4, client: 'PT. Solusi Digital', project: 'Web Application', status: 'progress', budget: 65000000, progress: 45, deadline: '2024-02-05', description: 'Aplikasi web untuk manajemen inventori' },
                    { id: 5, client: 'PT. Teknologi Nusantara', project: 'Landing Page', status: 'completed', budget: 8000000, progress: 100, deadline: '2024-01-25', description: 'Landing page untuk campaign produk baru' }
                ];
                nextProjectId = 6;
                saveData();
            }
        }

        function saveData() {
            localStorage.setItem('projectsData', JSON.stringify(projectsData));
        }

        function showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            const icon = type === 'success' ? 'bx-check-circle' : type === 'error' ? 'bx-error-circle' : 'bx-info-circle';
            toast.innerHTML = `<i class='bx ${icon}'></i><span>${message}</span>`;
            document.body.appendChild(toast);
            setTimeout(() => {
                toast.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

        // Login System
        function openLogin() {
            document.getElementById('loginModal').classList.add('active');
        }

        function closeLogin() {
            document.getElementById('loginModal').classList.remove('active');
        }

        function handleLogin(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            if ((username === 'user' && password === 'user123') || (username === 'admin' && password === 'admin123')) {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('userRole', role);
                localStorage.setItem('username', username);
                updateAuthUI();
                closeLogin();
                if (role === 'admin') {
                    initializeCharts();
                    startRealTimeUpdates();
                    loadProjectData();
                    updateStats();
                }
                showToast(`Login berhasil sebagai ${role === 'admin' ? 'Administrator' : 'User'}!`, 'success');
                if (role === 'admin') {
                    setTimeout(() => {
                        document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
                    }, 500);
                }
            } else {
                showToast('Username atau password salah!', 'error');
            }
        }

        function logout() {
            if (confirm('Apakah Anda yakin ingin logout?')) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('userRole');
                localStorage.removeItem('username');
                updateAuthUI();
                stopRealTimeUpdates();
                showToast('Anda telah logout', 'info');
                setTimeout(() => location.reload(), 1000);
            }
        }

        function updateAuthUI() {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            const userRole = localStorage.getItem('userRole');
            const username = localStorage.getItem('username');
            const authSection = document.querySelector('.auth-section');
            const adminMenus = document.querySelectorAll('.admin-menu');
            const adminSections = document.querySelectorAll('.admin-only');

            if (isLoggedIn) {
                authSection.innerHTML = `
                    <div class="user-info">
                        <span class="user-badge">
                            <i class='bx ${userRole === 'admin' ? 'bx-shield-alt-2' : 'bx-user'}'></i>
                            ${username}
                        </span>
                        <button class="auth-btn logout-btn" onclick="logout()">
                            <i class='bx bx-log-out'></i> Logout
                        </button>
                    </div>
                `;
                if (userRole === 'admin') {
                    adminMenus.forEach(menu => menu.style.display = 'block');
                    adminSections.forEach(section => section.classList.add('show'));
                } else {
                    adminMenus.forEach(menu => menu.style.display = 'none');
                    adminSections.forEach(section => section.classList.remove('show'));
                }
            } else {
                authSection.innerHTML = `
                    <button class="auth-btn" id="authBtn" onclick="openLogin()">
                        <i class='bx bx-log-in'></i> Login
                    </button>
                `;
                adminMenus.forEach(menu => menu.style.display = 'none');
                adminSections.forEach(section => section.classList.remove('show'));
            }
        }

        function toggleMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.toggle('active');
        }

        function closeMenu() {
            const navLinks = document.getElementById('navLinks');
            navLinks.classList.remove('active');
        }

        // CRUD Functions
        function openAddModal() {
            document.getElementById('crudModalTitle').textContent = 'Tambah Proyek Baru';
            document.getElementById('crudModalDesc').textContent = 'Lengkapi informasi proyek dengan detail';
            document.getElementById('saveButtonText').textContent = 'Simpan Proyek';
            document.getElementById('projectId').value = '';
            document.getElementById('clientName').value = '';
            document.getElementById('projectName').value = '';
            document.getElementById('projectStatus').value = 'pending';
            document.getElementById('projectBudget').value = '';
            document.getElementById('projectProgress').value = '0';
            document.getElementById('projectDeadline').value = '';
            document.getElementById('projectDescription').value = '';
            document.getElementById('crudModal').classList.add('active');
        }

        function openEditModal(id) {
            const project = projectsData.find(p => p.id === id);
            if (!project) return;
            document.getElementById('crudModalTitle').textContent = 'Edit Proyek';
            document.getElementById('crudModalDesc').textContent = 'Perbarui informasi proyek';
            document.getElementById('saveButtonText').textContent = 'Update Proyek';
            document.getElementById('projectId').value = project.id;
            document.getElementById('clientName').value = project.client;
            document.getElementById('projectName').value = project.project;
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectBudget').value = project.budget;
            document.getElementById('projectProgress').value = project.progress;
            document.getElementById('projectDeadline').value = project.deadline;
            document.getElementById('projectDescription').value = project.description || '';
            document.getElementById('crudModal').classList.add('active');
        }

        function closeCrudModal() {
            document.getElementById('crudModal').classList.remove('active');
        }

        function handleSaveProject(event) {
            event.preventDefault();
            const id = document.getElementById('projectId').value;
            const projectData = {
                client: document.getElementById('clientName').value,
                project: document.getElementById('projectName').value,
                status: document.getElementById('projectStatus').value,
                budget: parseInt(document.getElementById('projectBudget').value),
                progress: parseInt(document.getElementById('projectProgress').value),
                deadline: document.getElementById('projectDeadline').value,
                description: document.getElementById('projectDescription').value
            };

            if (id) {
                const index = projectsData.findIndex(p => p.id === parseInt(id));
                if (index !== -1) {
                    projectsData[index] = { ...projectsData[index], ...projectData };
                    showToast('Proyek berhasil diupdate!', 'success');
                }
            } else {
                projectData.id = nextProjectId++;
                projectsData.push(projectData);
                showToast('Proyek baru berhasil ditambahkan!', 'success');
            }
            saveData();
            loadProjectData();
            updateStats();
            updateCharts();
            closeCrudModal();
        }

        function deleteProject(id) {
            if (confirm('Apakah Anda yakin ingin menghapus proyek ini?')) {
                const index = projectsData.findIndex(p => p.id === id);
                if (index !== -1) {
                    const project = projectsData[index];
                    projectsData.splice(index, 1);
                    saveData();
                    loadProjectData();
                    updateStats();
                    updateCharts();
                    showToast(`Proyek "${project.project}" berhasil dihapus!`, 'success');
                }
            }
        }

        function loadProjectData() {
            const tbody = document.getElementById('projectTableBody');
            if (!tbody) return;
            tbody.innerHTML = '';

            if (projectsData.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 3rem; color: var(--text-light);">
                            <i class='bx bx-folder-open' style="font-size: 3rem; display: block; margin-bottom: 1rem;"></i>
                            <p>Belum ada data proyek. Klik "Tambah Proyek" untuk menambahkan proyek baru.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            projectsData.forEach((project, index) => {
                const statusText = project.status === 'completed' ? 'Selesai' : project.status === 'progress' ? 'Progress' : 'Pending';
                const budgetFormatted = new Intl.NumberFormat('id-ID', {
                    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(project.budget);
                const deadlineDate = new Date(project.deadline);
                const deadlineFormatted = deadlineDate.toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric'
                });
                const row = `
                    <tr>
                        <td style="font-weight: 600;">${index + 1}</td>
                        <td style="font-weight: 600; color: var(--text);">${project.client}</td>
                        <td>${project.project}</td>
                        <td><span class="status-badge ${project.status}">${statusText}</span></td>
                        <td style="font-weight: 600;">${budgetFormatted}</td>
                        <td>${project.progress}%</td>
                        <td>${deadlineFormatted}</td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary btn-sm" onclick="openEditModal(${project.id})" title="Edit">
                                    <i class='bx bx-edit'></i>
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteProject(${project.id})" title="Hapus">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                tbody.insertAdjacentHTML('beforeend', row);
            });
        }

        function searchProjects() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const rows = document.querySelectorAll('#projectTableBody tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        }

        function updateStats() {
            const totalProjects = projectsData.length;
            const uniqueClients = new Set(projectsData.map(p => p.client)).size;
            const totalRevenue = projectsData.reduce((sum, p) => sum + p.budget, 0);
            const activeProjects = projectsData.filter(p => p.status === 'progress').length;
            document.getElementById('totalProjects').textContent = totalProjects;
            document.getElementById('totalClients').textContent = uniqueClients;
            document.getElementById('totalRevenue').textContent = new Intl.NumberFormat('id-ID', {
                style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0
            }).format(totalRevenue);
            document.getElementById('activeProjects').textContent = activeProjects;
        }

        function refreshData() {
            const btn = event.target.closest('.btn');
            const icon = btn.querySelector('i');
            icon.style.animation = 'spin 1s linear';
            setTimeout(() => {
                loadProjectData();
                updateStats();
                updateCharts();
                icon.style.animation = '';
                showToast('Data berhasil diperbarui!', 'success');
            }, 1000);
        }

        function exportData() {
            if (projectsData.length === 0) {
                showToast('Tidak ada data untuk diexport!', 'error');
                return;
            }
            const headers = ['No', 'Klien', 'Proyek', 'Status', 'Budget', 'Progress', 'Deadline', 'Deskripsi'];
            const csvContent = [
                headers.join(','),
                ...projectsData.map((project, index) => {
                    const statusText = project.status === 'completed' ? 'Selesai' : project.status === 'progress' ? 'Progress' : 'Pending';
                    return [
                        index + 1, `"${project.client}"`, `"${project.project}"`, statusText,
                        project.budget, `${project.progress}%`, project.deadline, `"${project.description || '-'}"`
                    ].join(',');
                })
            ].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('href', url);
            link.setAttribute('download', `projects-data-${date}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Data berhasil diexport ke CSV!', 'success');
        }

        // Charts
        function initializeCharts() {
            const revenueCtx = document.getElementById('revenueChart');
            if (revenueCtx && !revenueChart) {
                revenueChart = new Chart(revenueCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                        datasets: [{
                            label: 'Revenue (juta)',
                            data: [45, 52, 38, 65, 72, 80],
                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                            borderColor: 'rgba(99, 102, 241, 1)',
                            borderWidth: 2,
                            borderRadius: 8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }

            const projectDistCtx = document.getElementById('projectDistribution');
            if (projectDistCtx && !projectDistChart) {
                projectDistChart = new Chart(projectDistCtx, {
                    type: 'pie',
                    data: {
                        labels: ['E-Commerce', 'Company Profile', 'Landing Page', 'Web App', 'Mobile App'],
                        datasets: [{
                            data: [30, 25, 20, 15, 10],
                            backgroundColor: [
                                'rgba(99, 102, 241, 0.8)', 'rgba(14, 165, 233, 0.8)',
                                'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { padding: 15, font: { size: 12 } }
                            }
                        }
                    }
                });
            }

            const clientTrendCtx = document.getElementById('clientTrendChart');
            if (clientTrendCtx && !clientTrendChart) {
                clientTrendChart = new Chart(clientTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
                        datasets: [{
                            label: 'Klien Baru',
                            data: [5, 8, 6, 10, 12, 9],
                            borderColor: 'rgba(16, 185, 129, 1)',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderWidth: 3,
                            pointRadius: 5,
                            pointHoverRadius: 7
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
                            x: { grid: { display: false } }
                        }
                    }
                });
            }

            const projectStatusCtx = document.getElementById('projectStatusChart');
            if (projectStatusCtx && !projectStatusChart) {
                updateStatusChart();
            }
        }

        function updateStatusChart() {
            const completed = projectsData.filter(p => p.status === 'completed').length;
            const progress = projectsData.filter(p => p.status === 'progress').length;
            const pending = projectsData.filter(p => p.status === 'pending').length;

            const projectStatusCtx = document.getElementById('projectStatusChart');
            if (projectStatusChart) {
                projectStatusChart.data.datasets[0].data = [completed, progress, pending];
                projectStatusChart.update();
            } else if (projectStatusCtx) {
                projectStatusChart = new Chart(projectStatusCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Selesai', 'Dalam Progress', 'Pending'],
                        datasets: [{
                            data: [completed, progress, pending],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 2,
                            borderColor: '#fff'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { padding: 15, font: { size: 12 } }
                            }
                        },
                        cutout: '60%'
                    }
                });
            }
        }

        function updateCharts() {
            updateStatusChart();
        }

        // Real-time Updates
        const activities = [
            { icon: 'success', title: 'Proyek baru dimulai', desc: 'E-Commerce untuk PT. Digital Indonesia', time: 'Baru saja' },
            { icon: 'info', title: 'Meeting dengan klien', desc: 'Diskusi fitur mobile app untuk Startup XYZ', time: '15 menit yang lalu' },
            { icon: 'success', title: 'Proyek selesai', desc: 'Landing page untuk PT. Teknologi Nusantara', time: '1 jam yang lalu' },
            { icon: 'warning', title: 'Deadline mendekat', desc: 'Company profile untuk CV. Maju Jaya - 3 hari lagi', time: '2 jam yang lalu' },
            { icon: 'info', title: 'Pembayaran diterima', desc: 'DP 50% dari PT. Solusi Digital', time: '3 jam yang lalu' }
        ];

        function addActivity() {
            const activityList = document.getElementById('activityList');
            if (!activityList) return;

            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            const now = new Date();
            const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            const activityHTML = `
                <div class="activity-item" style="animation: fadeInUp 0.5s ease;">
                    <div class="activity-icon ${randomActivity.icon}">
                        <i class='bx ${randomActivity.icon === 'success' ? 'bx-check-circle' : randomActivity.icon === 'warning' ? 'bx-error-circle' : 'bx-info-circle'}'></i>
                    </div>
                    <div class="activity-content">
                        <h5>${randomActivity.title}</h5>
                        <p>${randomActivity.desc}</p>
                        <div class="activity-time">${timeStr}</div>
                    </div>
                </div>
            `;

            activityList.insertAdjacentHTML('afterbegin', activityHTML);
            const items = activityList.querySelectorAll('.activity-item');
            if (items.length > 8) {
                items[items.length - 1].remove();
            }
        }

        function startRealTimeUpdates() {
            const activityList = document.getElementById('activityList');
            if (activityList) {
                activityList.innerHTML = '';
                activities.forEach((activity, index) => {
                    setTimeout(() => addActivity(), index * 100);
                });
            }
            updateInterval = setInterval(addActivity, 10000);
        }

        function stopRealTimeUpdates() {
            if (updateInterval) {
                clearInterval(updateInterval);
            }
        }

        // Close modals when clicking outside
        document.getElementById('loginModal').addEventListener('click', function (e) {
            if (e.target === this) closeLogin();
        });

        document.getElementById('crudModal').addEventListener('click', function (e) {
            if (e.target === this) closeCrudModal();
        });

        // Initialize on page load
        window.addEventListener('DOMContentLoaded', function () {
            initializeData();
            updateAuthUI();
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'admin') {
                setTimeout(() => {
                    initializeCharts();
                    startRealTimeUpdates();
                    loadProjectData();
                    updateStats();
                }, 1000);
            }
        });
