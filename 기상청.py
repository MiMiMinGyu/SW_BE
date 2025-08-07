import requests
import datetime

#base_date와 base_time을 자동으로 계산
now = datetime.datetime.now()
today = now.strftime('%Y%m%d')

#기상청 단기예보 0200, 0500, 0800, 1100, 1400, 1700, 2000, 2300에 발표 그래서 리스트에 정보 삽입
available_times = ["0200", "0500", "0800", "1100", "1400", "1700", "2000", "2300"]
current_time = now.strftime('%H00')

base_time = "2300"
for t in available_times:
    if current_time >= t:
        base_time = t
    else:
        break

#새벽 2시 이전이면 전날 23시 예보 사용
if current_time < "0200":
    yesterday = now - datetime.timedelta(days=1)
    today = yesterday.strftime('%Y%m%d')

api_key = "vuyesfGwd5Y7A87LzQG0fnbveZTgxKbELLxi9d3VoOcIG18oJNhZR11%2BE9cyPgF%2FeGL7U%2B1yeabBMoHH1RrXww%3D%3D"
base_date = today
nx = "62"
ny = "128"

url = f"http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey={api_key}&dataType=JSON&base_date={base_date}&base_time={base_time}&nx={nx}&ny={ny}&numOfRows=100"

response = requests.get(url, timeout=10)
data = response.json()

#원하는 시간으로 설정
target_time = (now + datetime.timedelta(hours=2)).strftime('%H00') #2시간 뒤 예보
items = data['response']['body']['items']['item']
weather_info = {}

for item in items:
    if item['fcstTime'] == target_time:
        category = item['category']
        value = item['fcstValue']
        
        if category == 'TMP':
            weather_info['기온'] = f"{value}°C"
        elif category == 'SKY':
            sky_state = {"1": "맑음 ☀️", "3": "구름많음 🌥️", "4": "흐림 ☁️"}
            weather_info['하늘'] = sky_state.get(value, "알 수 없음")
        elif category == 'PTY':
            pty_state = {"0": "없음", "1": "비 💧", "2": "비/눈", "3": "눈 ❄️", "4": "소나기"}
            if value != "0":
                weather_info['강수'] = pty_state.get(value, "알 수 없음")
        elif category == 'POP':
            weather_info['강수확률'] = f"{value}%"

#결과가 있을 때만 출력
print(f"양주시 {target_time[:2]}시 날씨 예보")
if weather_info:
    for key, value in weather_info.items():
        print(f"{key}: {value}")
else:
    print("해당 시간의 정보가 없습니다.")