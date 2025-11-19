import asyncio
import sys
from datetime import datetime, timedelta
import random

sys.path.insert(0, 'backend')
from prisma import Prisma

async def create_sample_checkins():
    prisma = Prisma()
    await prisma.connect()

    # Get all users
    users = await prisma.usuario.find_many()

    if not users:
        print("No users found!")
        await prisma.disconnect()
        return

    print(f"Found {len(users)} users")

    # Create checkins for the last 14 days for first 3 users
    for user in users[:3]:
        print(f"\nCreating checkins for user: {user.nome} ({user.id})")

        for days_ago in range(14, -1, -1):
            checkin_date = datetime.utcnow() - timedelta(days=days_ago)

            # Random but realistic biometric data
            base_focus = random.randint(50, 90)
            base_stress = random.randint(20, 60)

            await prisma.checkinbio.create(
                data={
                    "idUsuario": user.id,
                    "nivelFoco": base_focus + random.randint(-10, 10),
                    "nivelEstresse": base_stress + random.randint(-10, 10),
                    "horasSono": round(random.uniform(5.5, 8.5), 1),
                    "qualidadeSono": random.randint(5, 10),
                    "nivelFadiga": random.randint(20, 60),
                    "origemDados": "SIMULACAO",
                    "dataHora": checkin_date,
                    "diaDaSemana": checkin_date.weekday(),
                    "horaDoDia": random.randint(8, 18)
                }
            )

        print(f"Created 15 checkins for {user.nome}")

    await prisma.disconnect()
    print("\n✓ Sample checkin data created successfully!")

if __name__ == "__main__":
    asyncio.run(create_sample_checkins())
