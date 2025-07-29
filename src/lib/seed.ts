
'use server'

import { collection, getDocs, writeBatch, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { pets, communityGroups, posts } from '@/lib/placeholder-data';

export async function seedDatabase(): Promise<string> {
    try {
        const batch = writeBatch(db);
        const systemUserId = 'petora-system-user';
        let seededCount = 0;

        // Seed pets
        const petsCollection = collection(db, 'pets');
        const petsSnapshot = await getDocs(petsCollection);
        if (petsSnapshot.empty) {
            console.log('Seeding pets...');
            pets.forEach(pet => {
                const docRef = doc(petsCollection);
                batch.set(docRef, {
                    ...pet,
                    createdAt: serverTimestamp(),
                    ownerId: systemUserId
                });
            });
            seededCount += pets.length;
            console.log('Pets queued for seeding.');
        }

        // Seed groups
        const groupsCollection = collection(db, 'groups');
        const groupsSnapshot = await getDocs(groupsCollection);
        if (groupsSnapshot.empty) {
            console.log('Seeding groups...');
            communityGroups.forEach(group => {
                const docRef = doc(groupsCollection);
                batch.set(docRef, {
                    ...group,
                    createdAt: serverTimestamp(),
                    ownerId: systemUserId
                });
            });
            seededCount += communityGroups.length;
            console.log('Groups queued for seeding.');
        }

        // Seed posts
        const postsCollection = collection(db, 'posts');
        const postsSnapshot = await getDocs(postsCollection);
        if (postsSnapshot.empty) {
            console.log('Seeding posts...');
            posts.forEach(post => {
                const docRef = doc(postsCollection);
                batch.set(docRef, {
                    ...post,
                    createdAt: serverTimestamp(),
                    authorId: systemUserId,
                    authorAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`,
                    likes: [],
                    comments: [],
                });
            });
            seededCount += posts.length;
            console.log('Posts queued for seeding.');
        }
        
        if (seededCount > 0) {
            await batch.commit();
            console.log("Database seeded successfully!");
            return `${seededCount} items have been added to the database.`;
        } else {
            console.log("Database already contains data, skipping seed.");
            return "Your database already has data, no new items were added.";
        }
    } catch (error) {
        console.error("Error seeding database:", error);
        throw new Error("Failed to seed database.");
    }
}
