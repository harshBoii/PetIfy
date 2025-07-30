import { NextResponse } from 'next/server'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { z } from 'zod'

// Zod schema for validating and coercing updates
const updatePetSchema = z.object({
  name: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().min(1).optional()),
  type: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().min(1).optional()),
  breed: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().optional()),
  age: z.preprocess(val => {
    if (val === '' || val == null) return undefined
    if (typeof val === 'string') {
      const n = parseInt(val, 10)
      return isNaN(n) ? undefined : n
    }
    return val
  }, z.number().int().nonnegative().optional()),
  gender: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().optional()),
  location: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().optional()),
  listingType: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().optional()),
  description: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().optional()),
  ownerId: z.preprocess(val => {
    if (val === '' || val == null) return undefined
    return typeof val === 'string' ? val : undefined
  }, z.string().optional()),
  imageUrl: z.preprocess(val => (val === '' || val == null ? undefined : val), z.string().optional()),
  price: z.preprocess(val => {
    if (val === '' || val == null) return undefined
    if (typeof val === 'string') {
      const n = parseFloat(val)
      return isNaN(n) ? undefined : n
    }
    return val
  }, z.number().nonnegative().optional()),
}).strict()

type UpdatePet = z.infer<typeof updatePetSchema>
interface Params { id: string }

// Standardized Zod error response
const zodErrorResponse = (error: z.ZodError) =>
  NextResponse.json({ errors: error.issues }, { status: 400 })

// GET /api/pets/[id]
export async function GET(
  _req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const pet = await db.collection('pets').findOne({ _id: new ObjectId(id) })
    if (!pet) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    let ownerEmail: string | null = null
    if (pet.ownerId && ObjectId.isValid(pet.ownerId)) {
      const owner = await db.collection('users').findOne(
        { _id: new ObjectId(pet.ownerId) },
        { projection: { email: 1 } }
      )
      ownerEmail = owner?.email ?? null
    }

    return NextResponse.json({
      id: pet._id.toString(),
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      gender: pet.gender,
      location: pet.location,
      listingType: pet.listingType,
      description: pet.description,
      ownerId: pet.ownerId?.toString() ?? null,
      imageUrl: pet.imageUrl ?? null,
      price: pet.price ?? null,
      createdAt: pet.createdAt,
      ownerEmail,
    })
  } catch (err) {
    console.error('GET /api/pets/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/pets/[id] - Update pet
export async function PUT(
  req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    // Only pick updateable fields
    const raw = await req.json()
    const {
      name, type, breed, age,
      gender, location, listingType,
      description, ownerId,
      imageUrl, price,
    } = raw as Record<string, any>

    const payload = { name, type, breed, age, gender, location, listingType, description, ownerId, imageUrl, price }
    const parsed = updatePetSchema.safeParse(payload)
    if (!parsed.success) {
      console.error('Validation errors:', parsed.error.issues)
      return zodErrorResponse(parsed.error)
    }

    const updateData: Partial<UpdatePet> = parsed.data
    // Convert ownerId to ObjectId only if it's valid
    if (updateData.ownerId && ObjectId.isValid(updateData.ownerId)) {
      (updateData as any).ownerId = new ObjectId(updateData.ownerId)
    } else {
      delete updateData.ownerId
    }

    const client = await clientPromise
    const db = client.db()
    const result = await db.collection('pets').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Pet updated successfully' })
  } catch (err) {
    console.error('PUT /api/pets/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// DELETE /api/pets/[id] - Remove pet
export async function DELETE(
  _req: Request,
  context: { params: Promise<Params> }
) {
  try {
    const { id } = await context.params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db()
    const result = await db.collection('pets').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Pet deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/pets/[id] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
