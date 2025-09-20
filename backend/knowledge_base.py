class KnowledgeBase:
    def __init__(self):
        self.health_data = {
            'diet': {
                'water': {
                    'recommendation': 'Drink at least 8 glasses (2 liters) of water daily',
                    'benefits': 'Improves skin health, aids digestion, boosts energy'
                },
                'fruits_vegetables': {
                    'recommendation': 'Eat at least 5 servings of fruits and vegetables daily',
                    'benefits': 'Provides essential vitamins, minerals, and fiber'
                }
            },
            'exercise': {
                'cardio': {
                    'recommendation': '150 minutes of moderate or 75 minutes of vigorous cardio weekly',
                    'benefits': 'Improves heart health, boosts mood, helps with weight management'
                },
                'strength': {
                    'recommendation': 'Strength training exercises 2-3 times per week',
                    'benefits': 'Builds muscle, increases metabolism, strengthens bones'
                }
            },
            'sleep': {
                'duration': {
                    'recommendation': '7-9 hours of quality sleep per night',
                    'benefits': 'Improves memory, boosts immune system, enhances mood'
                },
                'quality': {
                    'recommendation': 'Maintain consistent sleep schedule and create restful environment',
                    'benefits': 'More restorative sleep, better energy levels, improved health'
                }
            }
        }
    
    def get_info(self, category, topic):
        if category in self.health_data and topic in self.health_data[category]:
            return self.health_data[category][topic]
        return None
    
    def search(self, query):
        results = []
        query = query.lower()
        
        for category, topics in self.health_data.items():
            for topic, info in topics.items():
                if query in category.lower() or query in topic.lower() or query in info['recommendation'].lower():
                    results.append({
                        'category': category,
                        'topic': topic,
                        'info': info
                    })
        
        return results