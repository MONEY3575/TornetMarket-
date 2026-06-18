// Admin Management System for TornetMarket
// Handles admin functions: user management, transaction approvals, wallet controls, etc.

class AdminManager {
    constructor() {
        this.adminKey = 'tornetMarketAdmins';
        this.transactionKey = 'tornetMarketTransactions';
        this.walletLockKey = 'tornetMarketWalletLocks';
        this.withdrawalKey = 'tornetMarketWithdrawals';
        this.initializeAdmins();
    }

    initializeAdmins() {
        if (!localStorage.getItem(this.adminKey)) {
            const admins = {
                'admin': {
                    username: 'admin',
                    password: this.hashPassword('admin123!'),
                    email: 'admin@tornetmarket.com',
                    role: 'super-admin',
                    permissions: ['all'],
                    createdAt: new Date().toISOString(),
                    active: true
                }
            };
            localStorage.setItem(this.adminKey, JSON.stringify(admins));
        }

        // Initialize transaction storage if needed
        if (!localStorage.getItem(this.transactionKey)) {
            localStorage.setItem(this.transactionKey, JSON.stringify([]));
        }

        // Initialize wallet locks storage
        if (!localStorage.getItem(this.walletLockKey)) {
            localStorage.setItem(this.walletLockKey, JSON.stringify({}));
        }

        // Initialize withdrawals storage
        if (!localStorage.getItem(this.withdrawalKey)) {
            localStorage.setItem(this.withdrawalKey, JSON.stringify([]));
        }
    }

    // Hash password (simple hash for development)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    // Admin login
    adminLogin(username, password) {
        const admins = JSON.parse(localStorage.getItem(this.adminKey));
        const admin = admins[username];

        if (!admin) {
            return { success: false, message: 'Admin not found' };
        }

        if (!admin.active) {
            return { success: false, message: 'Admin account is deactivated' };
        }

        if (admin.password !== this.hashPassword(password)) {
            return { success: false, message: 'Invalid password' };
        }

        const session = {
            username: username,
            role: admin.role,
            permissions: admin.permissions,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem('adminSession', JSON.stringify(session));
        return { success: true, message: 'Admin login successful', admin: username };
    }

    // Check if user is admin
    isAdmin() {
        const session = localStorage.getItem('adminSession');
        return session !== null;
    }

    // Get admin session
    getAdminSession() {
        const session = localStorage.getItem('adminSession');
        return session ? JSON.parse(session) : null;
    }

    // Admin logout
    adminLogout() {
        localStorage.removeItem('adminSession');
        return { success: true, message: 'Logged out successfully' };
    }

    // Get all users (for admin dashboard)
    getAllUsers() {
        const users = JSON.parse(localStorage.getItem('tornetMarketUsers')) || {};
        return Object.values(users).map(user => {
            const { password, ...safeUser } = user;
            return safeUser;
        });
    }

    // Get user details
    getUserDetails(username) {
        const users = JSON.parse(localStorage.getItem('tornetMarketUsers')) || {};
        const user = users[username];
        if (user) {
            const { password, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }

    // Suspend user account
    suspendUser(username, reason) {
        const users = JSON.parse(localStorage.getItem('tornetMarketUsers')) || {};
        if (users[username]) {
            users[username].suspended = true;
            users[username].suspensionReason = reason;
            users[username].suspendedAt = new Date().toISOString();
            localStorage.setItem('tornetMarketUsers', JSON.stringify(users));
            return { success: true, message: 'User suspended' };
        }
        return { success: false, message: 'User not found' };
    }

    // Unsuspend user account
    unsuspendUser(username) {
        const users = JSON.parse(localStorage.getItem('tornetMarketUsers')) || {};
        if (users[username]) {
            users[username].suspended = false;
            delete users[username].suspensionReason;
            delete users[username].suspendedAt;
            localStorage.setItem('tornetMarketUsers', JSON.stringify(users));
            return { success: true, message: 'User unsuspended' };
        }
        return { success: false, message: 'User not found' };
    }

    // ===== WALLET LOCK CONTROLS =====
    // Lock user wallet
    lockWallet(username, reason, duration) {
        const locks = JSON.parse(localStorage.getItem(this.walletLockKey));
        locks[username] = {
            locked: true,
            reason: reason,
            lockedAt: new Date().toISOString(),
            duration: duration, // in hours
            expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000).toISOString(),
            lockedBy: this.getAdminSession().username
        };
        localStorage.setItem(this.walletLockKey, JSON.stringify(locks));
        return { success: true, message: 'Wallet locked', lockInfo: locks[username] };
    }

    // Unlock user wallet
    unlockWallet(username) {
        const locks = JSON.parse(localStorage.getItem(this.walletLockKey));
        if (locks[username]) {
            delete locks[username];
            localStorage.setItem(this.walletLockKey, JSON.stringify(locks));
            return { success: true, message: 'Wallet unlocked' };
        }
        return { success: false, message: 'Wallet not locked' };
    }

    // Check if wallet is locked
    isWalletLocked(username) {
        const locks = JSON.parse(localStorage.getItem(this.walletLockKey));
        if (!locks[username]) return false;

        const lock = locks[username];
        const now = new Date();
        const expiresAt = new Date(lock.expiresAt);

        if (now > expiresAt) {
            // Lock has expired
            delete locks[username];
            localStorage.setItem(this.walletLockKey, JSON.stringify(locks));
            return false;
        }

        return lock.locked;
    }

    // Get wallet lock info
    getWalletLockInfo(username) {
        const locks = JSON.parse(localStorage.getItem(this.walletLockKey));
        return locks[username] || null;
    }

    // Get all locked wallets
    getAllLockedWallets() {
        const locks = JSON.parse(localStorage.getItem(this.walletLockKey));
        return Object.entries(locks).map(([username, lock]) => ({
            username,
            ...lock
        }));
    }

    // ===== WITHDRAWAL & TRANSACTION MANAGEMENT =====
    // Create withdrawal request
    createWithdrawal(username, amount, address, method) {
        const withdrawal = {
            withdrawalId: 'WD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            username: username,
            amount: amount,
            address: address,
            method: method,
            status: 'pending', // pending, approved, rejected, completed
            createdAt: new Date().toISOString(),
            approvedAt: null,
            approvedBy: null,
            completedAt: null,
            rejectionReason: null
        };

        let withdrawals = JSON.parse(localStorage.getItem(this.withdrawalKey)) || [];
        withdrawals.push(withdrawal);
        localStorage.setItem(this.withdrawalKey, JSON.stringify(withdrawals));

        return { success: true, message: 'Withdrawal request created', withdrawalId: withdrawal.withdrawalId };
    }

    // Get all withdrawals
    getAllWithdrawals() {
        return JSON.parse(localStorage.getItem(this.withdrawalKey)) || [];
    }

    // Get pending withdrawals
    getPendingWithdrawals() {
        const withdrawals = this.getAllWithdrawals();
        return withdrawals.filter(w => w.status === 'pending');
    }

    // Get user withdrawals
    getUserWithdrawals(username) {
        const withdrawals = this.getAllWithdrawals();
        return withdrawals.filter(w => w.username === username);
    }

    // Approve withdrawal
    approveWithdrawal(withdrawalId) {
        const admin = this.getAdminSession();
        if (!admin) {
            return { success: false, message: 'Not authenticated as admin' };
        }

        let withdrawals = JSON.parse(localStorage.getItem(this.withdrawalKey)) || [];
        const withdrawal = withdrawals.find(w => w.withdrawalId === withdrawalId);

        if (!withdrawal) {
            return { success: false, message: 'Withdrawal not found' };
        }

        withdrawal.status = 'approved';
        withdrawal.approvedAt = new Date().toISOString();
        withdrawal.approvedBy = admin.username;

        localStorage.setItem(this.withdrawalKey, JSON.stringify(withdrawals));

        // Log transaction
        this.logTransaction({
            type: 'withdrawal',
            username: withdrawal.username,
            amount: withdrawal.amount,
            address: withdrawal.address,
            method: withdrawal.method,
            status: 'approved',
            withdrawalId: withdrawalId,
            approvedBy: admin.username
        });

        return { success: true, message: 'Withdrawal approved', withdrawal: withdrawal };
    }

    // Reject withdrawal
    rejectWithdrawal(withdrawalId, reason) {
        const admin = this.getAdminSession();
        if (!admin) {
            return { success: false, message: 'Not authenticated as admin' };
        }

        let withdrawals = JSON.parse(localStorage.getItem(this.withdrawalKey)) || [];
        const withdrawal = withdrawals.find(w => w.withdrawalId === withdrawalId);

        if (!withdrawal) {
            return { success: false, message: 'Withdrawal not found' };
        }

        withdrawal.status = 'rejected';
        withdrawal.rejectionReason = reason;
        withdrawal.approvedBy = admin.username;
        withdrawal.approvedAt = new Date().toISOString();

        localStorage.setItem(this.withdrawalKey, JSON.stringify(withdrawals));

        return { success: true, message: 'Withdrawal rejected', withdrawal: withdrawal };
    }

    // Complete withdrawal
    completeWithdrawal(withdrawalId) {
        let withdrawals = JSON.parse(localStorage.getItem(this.withdrawalKey)) || [];
        const withdrawal = withdrawals.find(w => w.withdrawalId === withdrawalId);

        if (!withdrawal) {
            return { success: false, message: 'Withdrawal not found' };
        }

        if (withdrawal.status !== 'approved') {
            return { success: false, message: 'Withdrawal must be approved first' };
        }

        withdrawal.status = 'completed';
        withdrawal.completedAt = new Date().toISOString();

        localStorage.setItem(this.withdrawalKey, JSON.stringify(withdrawals));

        return { success: true, message: 'Withdrawal completed', withdrawal: withdrawal };
    }

    // Change withdrawal address
    changeWithdrawalAddress(withdrawalId, newAddress) {
        let withdrawals = JSON.parse(localStorage.getItem(this.withdrawalKey)) || [];
        const withdrawal = withdrawals.find(w => w.withdrawalId === withdrawalId);

        if (!withdrawal) {
            return { success: false, message: 'Withdrawal not found' };
        }

        if (withdrawal.status !== 'pending') {
            return { success: false, message: 'Can only change address for pending withdrawals' };
        }

        const oldAddress = withdrawal.address;
        withdrawal.address = newAddress;
        withdrawal.addressChangedAt = new Date().toISOString();
        withdrawal.addressChangedBy = this.getAdminSession().username;
        withdrawal.previousAddress = oldAddress;

        localStorage.setItem(this.withdrawalKey, JSON.stringify(withdrawals));

        return { success: true, message: 'Withdrawal address changed', withdrawal: withdrawal };
    }

    // ===== TRANSACTION LOGGING =====
    // Log transaction
    logTransaction(transactionData) {
        let transactions = JSON.parse(localStorage.getItem(this.transactionKey)) || [];
        const transaction = {
            transactionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            ...transactionData,
            timestamp: new Date().toISOString()
        };

        transactions.push(transaction);
        localStorage.setItem(this.transactionKey, JSON.stringify(transactions));

        return { success: true, message: 'Transaction logged', transactionId: transaction.transactionId };
    }

    // Get all transactions
    getAllTransactions() {
        return JSON.parse(localStorage.getItem(this.transactionKey)) || [];
    }

    // Get user transactions
    getUserTransactions(username) {
        const transactions = this.getAllTransactions();
        return transactions.filter(t => t.username === username);
    }

    // Get pending transactions
    getPendingTransactions() {
        const transactions = this.getAllTransactions();
        return transactions.filter(t => t.status === 'pending');
    }

    // ===== DASHBOARD STATISTICS =====
    // Get dashboard stats
    getDashboardStats() {
        const users = this.getAllUsers();
        const withdrawals = this.getAllWithdrawals();
        const transactions = this.getAllTransactions();
        const lockedWallets = this.getAllLockedWallets();

        const totalUsers = users.length;
        const activeUsers = users.filter(u => !u.suspended).length;
        const suspendedUsers = users.filter(u => u.suspended).length;

        const totalWithdrawals = withdrawals.length;
        const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
        const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved').length;
        const completedWithdrawals = withdrawals.filter(w => w.status === 'completed').length;
        const totalWithdrawnAmount = withdrawals
            .filter(w => w.status === 'completed')
            .reduce((sum, w) => sum + w.amount, 0);

        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                suspended: suspendedUsers
            },
            withdrawals: {
                total: totalWithdrawals,
                pending: pendingWithdrawals,
                approved: approvedWithdrawals,
                completed: completedWithdrawals,
                totalAmount: totalWithdrawnAmount.toFixed(2)
            },
            transactions: {
                total: transactions.length
            },
            security: {
                lockedWallets: lockedWallets.length
            }
        };
    }

    // ===== ADMIN MANAGEMENT =====
    // Add new admin
    addAdmin(username, password, role, permissions) {
        const admins = JSON.parse(localStorage.getItem(this.adminKey));

        if (admins[username]) {
            return { success: false, message: 'Admin already exists' };
        }

        admins[username] = {
            username: username,
            password: this.hashPassword(password),
            role: role,
            permissions: permissions,
            createdAt: new Date().toISOString(),
            active: true
        };

        localStorage.setItem(this.adminKey, JSON.stringify(admins));
        return { success: true, message: 'Admin created successfully' };
    }

    // Get all admins
    getAllAdmins() {
        const admins = JSON.parse(localStorage.getItem(this.adminKey));
        return Object.values(admins).map(admin => {
            const { password, ...safeAdmin } = admin;
            return safeAdmin;
        });
    }

    // Update admin permissions
    updateAdminPermissions(username, permissions) {
        const admins = JSON.parse(localStorage.getItem(this.adminKey));
        if (admins[username]) {
            admins[username].permissions = permissions;
            localStorage.setItem(this.adminKey, JSON.stringify(admins));
            return { success: true, message: 'Admin permissions updated' };
        }
        return { success: false, message: 'Admin not found' };
    }

    // Deactivate admin
    deactivateAdmin(username) {
        const admins = JSON.parse(localStorage.getItem(this.adminKey));
        if (admins[username]) {
            admins[username].active = false;
            localStorage.setItem(this.adminKey, JSON.stringify(admins));
            return { success: true, message: 'Admin deactivated' };
        }
        return { success: false, message: 'Admin not found' };
    }
}

// Initialize global admin manager
const adminManager = new AdminManager();
