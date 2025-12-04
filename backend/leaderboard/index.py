"""
Функция для работы с рейтингом игроков
Сохраняет и загружает данные пользователей из базы данных
"""

import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            cursor.execute("""
                SELECT id, name, level, points, progress, games_played, total_time
                FROM users
                ORDER BY points DESC, level DESC
                LIMIT 50
            """)
            
            users = []
            for row in cursor.fetchall():
                user_id, name, level, points, progress, games_played, total_time = row
                
                cursor.execute("""
                    SELECT subject, progress
                    FROM subject_progress
                    WHERE user_id = %s
                """, (user_id,))
                
                subject_progress = {}
                for subject_row in cursor.fetchall():
                    subject, subj_progress = subject_row
                    subject_progress[subject] = float(subj_progress)
                
                users.append({
                    'id': user_id,
                    'name': name,
                    'level': level,
                    'points': points,
                    'progress': float(progress),
                    'gamesPlayed': games_played,
                    'totalTime': total_time,
                    'subjectProgress': subject_progress
                })
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'users': users}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            user = body_data.get('user')
            
            if not user or not user.get('id') or not user.get('name'):
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid user data'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute("""
                INSERT INTO users (id, name, level, points, progress, games_played, total_time, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    level = EXCLUDED.level,
                    points = EXCLUDED.points,
                    progress = EXCLUDED.progress,
                    games_played = EXCLUDED.games_played,
                    total_time = EXCLUDED.total_time,
                    updated_at = CURRENT_TIMESTAMP
            """, (
                user['id'],
                user['name'],
                user.get('level', 1),
                user.get('points', 0),
                user.get('progress', 0),
                user.get('gamesPlayed', 0),
                user.get('totalTime', 0)
            ))
            
            subject_progress = user.get('subjectProgress', {})
            for subject, progress in subject_progress.items():
                cursor.execute("""
                    INSERT INTO subject_progress (user_id, subject, progress)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (user_id, subject) DO UPDATE SET
                        progress = EXCLUDED.progress
                """, (user['id'], subject, progress))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'user': user}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        conn.rollback()
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
