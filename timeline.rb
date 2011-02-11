require 'sinatra'
require 'rest-client'
require 'haml'
require 'json'

DEFAULT_QUERY_SIZE = 200

START_YEAR = 1900
END_YEAR = Time.now.year


get '/papers/:search_term' do |search_term|
  item_count = params['results'] || DEFAULT_QUERY_SIZE
  results = Timeline.query_yql %Q(select * from mendeley.search where query="#{search_term}" and items="#{item_count}")
  results = results['results']['json']
  papers = results['documents']

  total_pages = results['total_pages'].to_i
  if total_pages > 0
    pages = (1)..(4)
    pages.each do |page|
      query = %Q(select * from mendeley.search where query="#{search_term}" and items="#{item_count}" and page="#{page}")
      puts query
      more = Timeline.query_yql query
      papers += more['results']['json']['documents']
    end
  end
  
  timeline_json = Timeline.map_mendeley_json_to_timeline_json(papers)
  
  haml :'papers/timeline', :locals => {
    :timeline_data => timeline_json,
    :search_term => search_term,
    :items_found => "#{timeline_json.length} of #{results['total_results']} (page #{results['current_page']} of #{results['total_pages']})",
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

  def self.map_mendeley_json_to_timeline_json(json)
    json.delete_if {|n| begin n['year'].to_i == 0 rescue true end }
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