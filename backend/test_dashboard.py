import asyncio
from app import dashboard_manager, dashboard_collaborator, prisma

async def test():
    # Connect to Prisma
    print("Connecting to Prisma...")
    await prisma.connect()
    print("Connected!\n")

    try:
        print("Testing manager dashboard...")
        result = await dashboard_manager()
        print("SUCCESS! Manager dashboard returned data")
        print(f"Keys: {list(result.keys())}")
    except Exception as e:
        print(f"ERROR in manager dashboard: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

    print("\n" + "="*50 + "\n")

    try:
        print("Testing collaborator dashboard...")
        result = await dashboard_collaborator("col-0")
        print("SUCCESS! Collaborator dashboard returned data")
        print(f"Keys: {list(result.keys())}")
    except Exception as e:
        print(f"ERROR in collaborator dashboard: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

    # Disconnect
    await prisma.disconnect()

if __name__ == "__main__":
    asyncio.run(test())
