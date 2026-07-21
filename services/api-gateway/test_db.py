import asyncio
import asyncpg

async def main():
    try:
        conn = await asyncpg.connect('postgresql://hera_user:dev_password_change_me@localhost:5433/hera_dev')
        print('Success!')
        await conn.close()
    except Exception as e:
        print('Error:', e)

asyncio.run(main())
