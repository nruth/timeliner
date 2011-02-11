require 'sinatra'
require 'rest-client'
require 'haml'
require 'json'

DEFAULT_QUERY_SIZE = 100

START_YEAR = 1900
END_YEAR = Time.now.year

get '/guardian/:search_term/from/:start/to/:end' do |search_term, start_year, end_year|
  item_count = params['results'] || DEFAULT_QUERY_SIZE
  results = Timeline.query_yql %Q(select * from guardian.content.search(#{item_count}) where q="#{search_term}" and from-date="#{start_year}-01-01" and to-date="#{end_year}-01-01")
  news = results['results']['content']

  haml :'news/timeline', :locals => {
    :timeline_data => Timeline.map_news_json_to_timeline_json(news),
    :search_term => search_term,
    :items_found => results['count'],
    :news => news
  }
end

get '/news/:search_term' do |search_term|
  item_count = params['results'] || DEFAULT_QUERY_SIZE
  results = Timeline.query_yql %Q(select * from guardian.content.search(#{item_count}) where q="#{search_term}" and from-date="1960-01-01" and to-date="1970-01-01")
  news = results['results']['content']

  haml :'news/timeline', :locals => {
    :timeline_data => Timeline.map_news_json_to_timeline_json(news),
    :search_term => search_term,
    :items_found => results['count'],
    :news => news
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
    :papers => papers
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

  def self.map_news_json_to_timeline_json(json)
    json.map do |element|
      n = {}
      n['start'] = element['web-publication-date']
      n['title'] = element['web-title']
      n['description'] = element['web-title']
      n['link'] = element['web-url']
      n
    end
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