require 'sinatra'
require 'rest-client'
require 'haml'
require 'json'

DEFAULT_QUERY_SIZE = 100

START_YEAR = 1900
END_YEAR = Time.now.year

get '/news/:search_term' do |search_term|
  item_count = params['results'] || DEFAULT_QUERY_SIZE
  result = Timeline.query_yql %Q(select title,abstract,url,date from search.news(#{item_count}) where query="#{search_term}")
  news = result['results']['result']

  haml :'news/timeline', :locals => {
    :search_term => search_term,
    :items_found => result['count'],
    :news => news.sort {|a,b| a['date'] <=> b['date']}
  }
end

get '/papers/:search_term' do |search_term|
  item_count = params['results'] || DEFAULT_QUERY_SIZE
  results = Timeline.query_yql %Q(select * from mendeley.search where query="#{search_term}" and items="#{item_count}")
  results = results['results']['json']
  papers = results['documents']

  haml :'papers/timeline', :locals => {
    :timeline_data => Timeline.map_mendeley_json_to_timeline_json(papers),
    :search_term => search_term,
    :items_found => "#{results['items_per_page']} of #{results['total_results']} (page #{results['current_page']} of #{results['total_pages']})",
    :papers => papers.sort {|b,a| a['year'] <=> b['year']}
  }
end

module Timeline
  # queries yql and returns a hashmap of the result
  def self.query_yql(query)
    json = RestClient.get("http://query.yahooapis.com/v1/public/yql",
      { :params => {
          :q => query,
          :format => 'json',
          :env => 'store://datatables.org/alltableswithkeys'
        }
      }
    )
    JSON.parse(json)['query']
  end

  def self.map_mendeley_json_to_timeline_json(json)
    json.delete_if {|n| (n['year'].to_i < START_YEAR) or (n['year'].to_i > END_YEAR)  }
    json.map do |element|
      n = {}
      n['start'] = element['year']
      n['title'] = element['title']
      n['description'] = "#{element['authors']} #{element['publication_outlet']}"
      n['link'] = element['mendeley_url']
      n
    end
  end
end