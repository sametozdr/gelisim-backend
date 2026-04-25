const admin = require('../config/firebase');
const { User } = require('../models');

const seedSuperAdmin = async () => {
    const adminEmail = 'admin@destekmerkezi.com';
    const adminPassword = 'Gelisim2026!'; // Sizin için belirlediğimiz şifre

    try {
        console.log('--- Admin Seeding Başlatıldı ---');
        
        let firebaseUser;
        try {
            // 1. Firebase'de kullanıcıyı ara
            firebaseUser = await admin.auth().getUserByEmail(adminEmail);
            console.log('Admin Firebase üzerinde zaten mevcut.');
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                // 2. Firebase'de kullanıcı yoksa oluştur
                firebaseUser = await admin.auth().createUser({
                    email: adminEmail,
                    password: adminPassword,
                    displayName: 'Süper Admin',
                    emailVerified: true
                });
                console.log('Süper Admin Firebase hesabı oluşturuldu.');
            } else {
                throw error;
            }
        }

        // 3. PostgreSQL Veritabanında kullanıcıyı ara veya oluştur
        const [user, created] = await User.findOrCreate({
            where: { firebase_uid: firebaseUser.uid },
            defaults: {
                email: adminEmail,
                full_name: 'Süper Admin',
                role: 'Admin',
                is_active: true
            }
        });

        if (created) {
            console.log('Süper Admin veritabanı kaydı oluşturuldu.');
        } else {
            // Eğer varsa rolünün 'Admin' olduğundan emin ol (güvenlik için)
            if (user.role !== 'Admin') {
                user.role = 'Admin';
                await user.save();
                console.log('Kullanıcı rolü Admin olarak güncellendi.');
            }
        }

        console.log('--- Admin Seeding Başarıyla Tamamlandı ---');
        console.log(`Giriş Bilgileri: ${adminEmail} / ${adminPassword}`);
        
    } catch (error) {
        console.error('Admin seeding sırasında kritik hata:', error);
    }
};

module.exports = { seedSuperAdmin };
