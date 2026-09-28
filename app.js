const { createApp } = Vue

createApp({
    data() {
        return {
            //Auth state
            isLoggedIn: false,
            isRegister: false,
            authError: '',
            authForm: {
                username: '',
                email: '',
                password: '',
            },
            // Session state
            showProblemForm: false,
            activeSession: null,
            sessionForm: {
                gym: '',
                date: new Date().toISOString().split('T')[0]
            },
            sessions: [],

            // Filters
            selectedStatus: '',
            selectedGrade: '',
            selectedStyle: '',

            editingId: null,
            isEditingProfile: false,

            user: {
                id: null,
                name: '',
                favoriteStyle: '',
                saveData: true
            },

            newProblem: {
                style: '',
                grade: '',
                tries: 1,
                status: 'Send',
                gym: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            },

            problems: []
        }
    },
    mounted() {
        this.checkSavedSession();
    },
    computed: {
        totalSends() {
            return this.problems.filter(p => p.status === 'Send').length;
        },
        activeProjects() {
            return this.problems.filter(p => p.status === 'Project').length;
        },
        totalFlashes() {
            return this.problems.filter(p => p.status === 'Send' && Number(p.tries) === 1).length;
        },
        totalResets() {
            return this.problems.filter(p => p.status === 'Reset').length;
        },

        // --- SESSION COMPUTED PROPERTIES ---
        sessionProblems() {
            if (!this.activeSession) return [];
            return this.problems.filter(p =>
                p.gym === this.activeSession.gym &&
                p.date === this.activeSession.date
            );
        },
        sessionSends() {
            return this.sessionProblems.filter(p => p.status === 'Send').length;
        },
        sessionFlashes() {
            return this.sessionProblems.filter(p => p.status === 'Send' && Number(p.tries) === 1).length;
        },
        sessionMaxGrade() {
            if (this.sessionProblems.length === 0) return '-';

            const gradeOrder = ['4', '5', '6A', '6B', '6C', '7A', '7B', '7C', '8A'];
            const sentGrades = this.sessionProblems
                .filter(p => p.status === 'Send')
                .map(p => p.grade);

            if (sentGrades.length === 0) return '-';

            return sentGrades.reduce((max, current) => {
                return gradeOrder.indexOf(current) > gradeOrder.indexOf(max) ? current : max;
            }, '4');

        },
        // --- DASHBOARD FILTERS ---
        filteredProblems() {
            const filtered = this.problems.filter(problem => {
                const statusVal = this.selectedStatus.toLowerCase();
                const probStatus = problem.status.toLowerCase();
                const isFlash = probStatus === 'flash' || (probStatus === 'send' && Number(problem.tries) === 1);

                let matchesStatus = true;
                if (statusVal === 'send') {
                    // Visa både Sends och Flashes under Sends
                    matchesStatus = probStatus === 'send' || probStatus === 'flash';
                } else if (statusVal === 'flash') {
                    // Visa bara det som faktiskt räknas som Flash
                    matchesStatus = isFlash;
                } else if (statusVal) {
                    matchesStatus = probStatus === statusVal;
                }

                const matchesGrade = !this.selectedGrade || problem.grade.toLowerCase() === this.selectedGrade.toLowerCase();
                const matchesStyle = !this.selectedStyle || problem.style.toLowerCase() === this.selectedStyle.toLowerCase();

                return matchesStatus && matchesGrade && matchesStyle;
            });

            // Sortera problem utifrån nyast datum
            return filtered.sort((a, b) => {
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();

                if (dateB === dateA) {
                    return b.id - a.id;
                }

                return dateB - dateA;
            });
        },
        hasActiveFilters() {
            return this.selectedStatus || this.selectedGrade || this.selectedStyle;
        }
    },
    methods: {
        // -- STORAGE KEYS HELPERS ---
        getProblemsStorageKey() {
            return this.user.id ? `crux_problems_${this.user.id}` : 'crux_demo_problems';
        },
        getActiveSessionStorageKey() {
            return this.user.id ? `crux_active_session_${this.user.id}` : 'crux_demo_active_session';
        },
        getSessionHistoryStorageKey() {
            return this.user.id ? `crux_sessions_${this.user.id}` : 'crux_demo_sessions';

        },
        // --- SESSION METHODS ---
        async fetchActiveSession() {
            if (this.user.id) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${this.user.id}/sessions/active`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.active) {
                            this.activeSession = {
                                id: data.session.id,
                                gym: data.session.gym,
                                date: data.session.climb_date ? data.session.climb_date.split('T')[0] : ''
                            };
                            if (this.user.saveData) {
                                localStorage.setItem(this.getActiveSessionStorageKey(), JSON.stringify(this.activeSession));
                            }
                            return;
                        } else {
                            this.activeSession = null;
                            localStorage.removeItem(this.getActiveSessionStorageKey());
                        }
                    }
                } catch (error) {
                    console.warn('Backend unavailable. Loading active session from localStorage.');
                }
            }
            // Fallback 
            const savedSession = localStorage.getItem(this.getActiveSessionStorageKey());
            if (savedSession) {
                this.activeSession = JSON.parse(savedSession);
            }
        },
        async startSession() {
            if (!this.sessionForm.gym) return;

            const payload = {
                gym: this.sessionForm.gym,
                climb_date: this.sessionForm.date
            };

            if (this.user.id) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${this.user.id}/sessions`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        const newSession = await response.json();
                        this.activeSession = {
                            id: newSession.id,
                            gym: newSession.gym,
                            date: newSession.climb_date ? newSession.climb_date.split('T')[0] : ''
                        };

                        if (this.user.saveData) {
                            localStorage.setItem(this.getActiveSessionStorageKey(), JSON.stringify(this.activeSession));
                        }
                        return;
                    }
                } catch (error) {
                    console.warn('POST session failed. Falling back to local session state.');
                }
            }
            this.activeSession = {
                id: Date.now(),
                gym: this.sessionForm.gym,
                date: this.sessionForm.date,
            };

            if (this.user.saveData) {
                localStorage.setItem(this.getActiveSessionStorageKey(), JSON.stringify(this.activeSession));
            }
        },
        async endSession() {
            if (!this.activeSession) return;

            const isBackendId = typeof this.activeSession.id === 'number' && this.activeSession.id < 1000000000000;

            if (this.user.id && isBackendId) {
                try {
                    await fetch(`http://localhost:3000/api/users/${this.user.id}/sessions/${this.activeSession.id}/end`, {
                        method: 'PATCH'
                    });
                } catch (error) {
                    console.warn('PATCH endSession failed. Ending locally.');
                }
            }
            // save ended session in history-list
            this.sessions.unshift({ ...this.activeSession });

            if (this.user.saveData) {
                localStorage.setItem(this.getSessionHistoryStorageKey(), JSON.stringify(this.sessions));
                localStorage.removeItem(this.getActiveSessionStorageKey());
            }

            // Reset UI state
            this.activeSession = null;
            this.sessionForm.gym = '';
            this.sessionForm.date = new Date().toISOString().split('T')[0];
            this.resetForm();
        },
        // --- AUTH & USER METHODS ---
        loginAsGuest() {
            this.authError = '';
            this.isLoggedIn = true;
            this.user = {
                id: null, // because of null all API-calls will be skipped
                name: 'Demo Climber',
                favoriteStyle: '',
                saveData: true
            };

            // Load current problems from localStorage if there is any, otherwise show demo data
            const savedProblems = localStorage.getItem('crux_demo_problems');
            if (savedProblems) {
                this.problems = JSON.parse(savedProblems);
            } else {
                this.problems = [
                    { id: 101, gym: 'Backa Boulder', grade: '6A', status: 'Send', style: 'Slab', tries: 1, date: '2026-09-22', notes: 'Demo climb' }
                ];
            }

            const savedActive = localStorage.getItem('crux_demo_active_session');
            if (savedActive) this.activeSession = JSON.parse(savedActive);

            const savedHistory = localStorage.getItem('crux_demo_sessions');
            if (savedHistory) this.sessions = JSON.parse(savedHistory);


            if (this.user.saveData) {
                localStorage.setItem('crux_user', JSON.stringify(this.user));
                localStorage.setItem('crux_demo_problems', JSON.stringify(this.problems));
            }
        },
        async checkSavedSession() {
            const savedUser = localStorage.getItem('crux_user');

            if (savedUser) {
                const parsedUser = JSON.parse(savedUser);
                this.user = { ...this.user, ...parsedUser };
                this.isLoggedIn = true;

                // Load previously saved sessions from localStorage as fallback
                const savedHistory = localStorage.getItem(this.getSessionHistoryStorageKey());
                if (savedHistory) {
                    this.sessions = JSON.parse(savedHistory);
                }

                if (this.user.id) {
                    await this.fetchActiveSession();
                    await this.fetchUserProblems(this.user.id);
                } else {
                    const savedProblems = localStorage.getItem('crux_demo_problems');
                    if (savedProblems) {
                        this.problems = JSON.parse(savedProblems);
                    }
                    const savedActive = localStorage.getItem('crux_demo_active_session');
                    if (savedActive) {
                        this.activeSession = JSON.parse(savedActive);
                    }
                }
            }
        },
        toggleAuthMode() {
            this.isRegister = !this.isRegister;
            this.authError = '';
            this.authForm = { username: '', email: '', password: '' };
        },
        async handleAuth() {
            this.authError = '';
            const endpoint = this.isRegister ? '/api/auth/register' : '/api/auth/login';

            try {
                const response = await fetch(`http://localhost:3000${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.authForm)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || data.error || 'Authentication failed.');
                }

                // Fetch User object
                const userObj = data.user || data;

                // Update Vue state
                this.isLoggedIn = true;
                this.user.id = userObj.id || null;
                this.user.name = userObj.username || this.authForm.username || 'Climber';

                // localStorage fallback
                if (this.user.saveData) {
                    localStorage.setItem('crux_user', JSON.stringify({
                        id: this.user.id,
                        name: this.user.name,
                        email: userObj.email || this.authForm.email,
                        favoriteStyle: this.user.favoriteStyle,
                        saveData: true
                    }));
                }

                // Fetch problems from backend if ID is present
                if (this.user.id) {
                    await this.fetchActiveSession();
                    await this.fetchUserProblems(this.user.id);
                }

                // clear authform
                this.authForm = { username: '', email: '', password: '' };

            } catch (error) {
                if (error.message === 'Failed to fetch') {
                    this.authError = 'Could not connect to backend server. Check if your API is running.';
                } else {
                    this.authError = error.message;
                }
            }
        },
        async fetchUserProblems(userId) {
            if (!userId) return;

            try {
                const response = await fetch(`http://localhost:3000/api/users/${userId}/problems`);
                if (!response.ok) throw new Error('Backed server unavailable');

                const data = await response.json();

                this.problems = data.map(p => ({
                    id: p.id,
                    style: p.style,
                    grade: p.grade,
                    tries: p.tries,
                    status: p.current_status,
                    gym: p.gym,
                    date: p.climb_date ? p.climb_date.split('T')[0] : '',
                    notes: p.notes
                }));

                // Save in localStorage if it´s choosen by the user
                if (this.user.saveData) {
                    localStorage.setItem(this.getProblemsStorageKey(), JSON.stringify(this.problems));
                }

            } catch (error) {
                console.warn('Backend is unavailable. Using localStorage as fallback:', error.message);

                // localStorage fallback when backend is missing
                if (this.user.saveData) {
                    const savedProblems = localStorage.getItem(this.getProblemsStorageKey());
                    if (savedProblems) {
                        this.problems = JSON.parse(savedProblems);
                    }
                }
            }
        },
        getDisplayStatus(problem) {
            const isFlash = problem.status.toLowerCase() === 'send' && Number(problem.tries) === 1;
            return isFlash ? 'FLASH' : problem.status;
        },
        resetFilters() {
            this.selectedStatus = '';
            this.selectedGrade = '';
            this.selectedStyle = '';
        },
        editProblem(problem) {
            this.editingId = problem.id;
            // Skapar en ny kopia till formuläret med alla fält genom spread-operatorn (...)
            this.newProblem = { ...problem };
            this.showProblemForm = true;

            // Vänta tills UI:n uppdaterats($nextTick), skrolla sedan till formuläret
            this.$nextTick(() => {
                if (this.$refs.formSection) {
                    this.$refs.formSection.scrollIntoView({ block: 'start' });
                }
            });
        },
        async saveProblem() {
            if (this.editingId) {
                await this.updateCurrentProblem(this.editingId);
            } else {
                await this.logNewProblem();
            }

            this.saveProfile();
            this.resetForm();
        },
        async logNewProblem() {
            const userId = this.user.id || null;
            const currentGym = this.activeSession ? this.activeSession.gym : this.newProblem.gym;
            const currentDate = this.activeSession ? this.activeSession.date : this.newProblem.date;

            const payload = {
                style: this.newProblem.style || null,
                grade: this.newProblem.grade || null,
                tries: Number(this.newProblem.tries) || 1,
                current_status: this.newProblem.status || 'Send',
                gym: currentGym || null,
                climb_date: currentDate,
                notes: this.newProblem.notes || null
            };

            const isBackendSession = this.activeSession && typeof this.activeSession.id === 'number' && this.activeSession.id < 1000000000000;

            if (isBackendSession) {
                try {
                    const response = await fetch(`http://localhost:3000/api/sessions/${this.activeSession.id}/problems`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        await this.fetchUserProblems(userId);
                        this.resetForm();
                        return;
                    }
                } catch (error) {
                    console.warn('POST problem to backend session failed. Falling back to local state.');
                }
            }

            // fallback when backend is missing
            this.problems.unshift({
                id: Date.now(),
                style: this.newProblem.style,
                grade: this.newProblem.grade,
                tries: this.newProblem.tries,
                status: this.newProblem.status,
                gym: currentGym,
                date: currentDate,
                notes: this.newProblem.notes
            });

            if (this.user.saveData) {
                this.saveProfile();
            }
        },
        async updateCurrentProblem(id) {
            const userId = this.user.id || null;
            const isLocalOnlyId = typeof id === 'number' && id > 1000000000000;

            const payload = {
                user_id: userId,
                style: this.newProblem.style || null,
                grade: this.newProblem.grade || null,
                tries: Number(this.newProblem.tries) || 1,
                current_status: this.newProblem.status || 'Send',
                gym: this.newProblem.gym || (this.activeSession ? this.activeSession.gym : null),
                climb_date: this.newProblem.date || (this.activeSession ? this.activeSession.date : null),
                notes: this.newProblem.notes || null
            };

            if (userId && !isLocalOnlyId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${userId}/problems/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        await this.fetchUserProblems(userId);
                        return;
                    }
                } catch (error) {
                    console.warn('PUT failed. Updating locally in UI/localStorage.');
                }
            }

            // fallback when backend is missing
            const index = this.problems.findIndex(p => p.id === id);
            if (index !== -1) {
                this.problems[index] = { ...this.newProblem, id };
            }
        },
        resetForm() {
            this.editingId = null;
            this.newProblem = {
                style: '',
                grade: '',
                tries: 1,
                status: 'Send',
                gym: '',
                date: new Date().toISOString().split('T')[0],
                notes: ''
            };
        },
        async markAsReset() {
            if (!this.editingId) return;

            this.newProblem.status = 'Reset';
            await this.updateCurrentProblem(this.editingId);

            this.saveProfile();
            this.resetForm();
        },
        async deleteProblem(id) {
            if (this.editingId === id) {
                this.resetForm();
            }

            const userId = this.user.id || null;
            const isLocalOnlyId = typeof id === 'number' && id > 1000000000000;

            if (userId && !isLocalOnlyId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/users/${userId}/problems/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        await this.fetchUserProblems(userId);
                        return;
                    }
                } catch (error) {
                    console.warn('DELETE failed. Removing locally from UI/localStorage.');
                }
            }

            // fallback when backend is missing
            this.problems = this.problems.filter(p => p.id !== id);
            if (this.user.saveData) {
                localStorage.setItem(this.getProblemsStorageKey(), JSON.stringify(this.problems));
            }
        },
        // --- PROFILE & STORAGE ---
        updateProfile() {
            this.saveProfile();
            this.isEditingProfile = false;
        },
        saveProfile() {
            if (this.user.saveData) {
                localStorage.setItem('crux_user', JSON.stringify(this.user));
                localStorage.setItem(this.getProblemsStorageKey(), JSON.stringify(this.problems));
                if (this.activeSession) {
                    localStorage.setItem(this.getActiveSessionStorageKey(), JSON.stringify(this.activeSession));
                }
                localStorage.setItem(this.getSessionHistoryStorageKey(), JSON.stringify(this.sessions));
            }
        },
        handleStorage() {
            if (!this.user.saveData) {
                // Om användaren slår av lokal sparning, rensa data från localStorage
                localStorage.removeItem('crux_user');
                localStorage.removeItem(this.getProblemsStorageKey());
                localStorage.removeItem(this.getActiveSessionStorageKey());
                localStorage.removeItem(this.getSessionHistoryStorageKey());
            } else {
                this.saveProfile();
            }
        },
        logout() {
            this.isLoggedIn = false;
            this.activeSession = null;
            this.showProblemForm = false;
            this.problems = [];
            this.sessions = [];
            this.user = {
                id: null,
                name: '',
                favoriteStyle: '',
                saveData: true
            };

            localStorage.removeItem('crux_user');
            localStorage.removeItem(this.getActiveSessionStorageKey());

        }
    }
}).mount('#app')