 const { createApp } = Vue

        createApp({
            data() {
                return {
                    selectedStatus: '',
                    selectedGrade: '',
                    selectedStyle: '',

                    editingId: null,
                    isEditingProfile: false,

                    user: {
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

                    problems: [
                        {
                            id: 1,
                            style: 'slab',
                            grade: '6B',
                            tries: 1,
                            status: 'Send',
                            gym: 'Backa Boulder',
                            date: '2026-09-01',
                            notes: 'Solved it on the first atempt!'
                        },
                        {
                            id: 2,
                            style: 'overhang',
                            grade: '6A',
                            tries: 3,
                            status: 'Project',
                            gym: 'Backa Boulder',
                            date: '2026-09-01',
                            notes: 'Still working on this one...'
                        }   
                    ]
                }
            },
            async created() {
                const savedUser = localStorage.getItem('bouldering_user');
                if (savedUser) {
                    this.user = JSON.parse(savedUser);
                }

                await this.fetchProblems();

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
                async fetchProblems() {
                    try {
                        const response = await fetch('http://localhost:3000/api/problems');
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
                    } catch (error) {
                        console.warn('Backend is unavailable. Using localStorage as fallback:', error.message);

                        // localStorage fallback
                        if (this.user.saveData) {
                            const savedProblems = localStorage.getItem('bouldering_problems');
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

                    // Vänta tills UI:n uppdaterats($nextTick), skrolla sedan till formuläret
                    this.$nextTick(() => {
                        this.$refs.formSection.scrollIntoView({ block: 'start' });
                    });
                },
                async saveProblem() {
                    if (this.editingId) {
                        await this.updateCurrentProblem(this.editingId);
                    } else {
                        await this.logNewProblem();
                    }

                    if (this.user.saveData) {
                        localStorage.setItem('bouldering_problems', JSON.stringify(this.problems));
                    }
                    this.resetForm();
                },
                 async logNewProblem() {
                    const payload = {
                        user_id: 1,
                        style: this.newProblem.style,
                        grade: this.newProblem.grade,
                        tries: this.newProblem.tries,
                        current_status: this.newProblem.status,
                        gym: this.newProblem.gym,
                        climb_date: this.newProblem.date,
                        notes: this.newProblem.notes
                    };

                   try {
                    const response = await fetch('http://localhost:3000/api/problems', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (response.ok) {
                        await this.fetchProblems();
                        return; 
                    }
                } catch (error) {
                    console.warn('POST failed. Saving locally in UI/localStorage.');
                }

                // fallback when backend is missing
                     this.problems.push({
                        id: Date.now(),
                        style: this.newProblem.style,
                        grade: this.newProblem.grade,
                        tries: this.newProblem.tries,
                        status: this.newProblem.status,
                        gym: this.newProblem.gym,
                        date: this.newProblem.date,
                        notes: this.newProblem.notes
                    });   
             },
                 async updateCurrentProblem(id) {
                    const payload = {
                            user_id: 1,
                            style: this.newProblem.style,
                            grade: this.newProblem.grade,
                            tries: Number(this.newProblem.tries),
                            current_status: this.newProblem.status,
                            gym: this.newProblem.gym,
                            climb_date: this.newProblem.date,
                            notes: this.newProblem.notes
                        };

                    try {
                        const respone = await fetch(`http://localhost:3000/api/problems/${id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });

                        if (respone.ok) {
                            await this.fetchProblems();
                            return;  
                        }
                    } catch (error) {
                        console.warn('PUT failed. Updating locally in UI/localStorage.');
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

                    if (this.user.saveData) {
                        localStorage.setItem('bouldering_problems', JSON.stringify(this.problems));
                    }

                    this.resetForm();
                },
                async deleteProblem(id) {
                    if (this.editingId === id) {
                        this.resetForm();
                    }

                    try {
                        const response = await fetch(`http://localhost:3000/api/problems/${id}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            await this.fetchProblems();
                            return;
                        }
                    } catch (error) {
                        console.warn('DELETE failed. Removing locally from UI/localStorage.');
                    } 

                    // fallback when backend is missing
                    this.problems = this.problems.filter(p => p.id !== id);
                    if (this.user.saveData) {
                        localStorage.setItem('bouldering_problems', JSON.stringify(this.problems));
                    }
                },
                updateProfile() {
                    this.saveProfile();
                    this.isEditingProfile = false;
                },
                saveProfile() {
                    if (this.user.saveData) {
                        localStorage.setItem('bouldering_user', JSON.stringify(this.user));
                        localStorage.setItem('bouldering_problems', JSON.stringify(this.problems));
                    }
                },
                handleStorage() {
                    if (!this.user.saveData) {
                        // Om användaren slår av lokal sparning, rensa data från localStorage
                        localStorage.removeItem('bouldering_user');
                        localStorage.removeItem('bouldering_problems');
                    } else {
                        this.saveProfile();
                    }
                }
            }
        }).mount('#app')