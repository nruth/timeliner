require File.dirname(__FILE__) + '/spec_helper'

set :environment, :test

describe '/papers/watermarking' do
  include Rack::Test::Methods

  def app
    Sinatra::Application
  end

  let(:empty_mendley_result) do
    { 'results' => {'json' => {'documents' => []} }}
  end

  it "queries YQL mendeley for watermarking, default 100 items" do
    Timeline.should_receive(:query_yql).with(
      %Q(select * from mendeley.search where query="watermarking" and items="100")
    ).and_return(empty_mendley_result)
    get subject
  end
  
  describe "?results=205" do
    it "should ask for 205 search results" do
      Timeline.should_receive(:query_yql).with(
        %Q(select * from mendeley.search where query="watermarking" and items="205")
      ).and_return(empty_mendley_result)
      get '/papers/watermarking?results=205'
    end
  end
end

describe "Timeline.json_query_yql(query)" do
  before(:each) do
    RestClient.stub!(:get).and_return json
  end
  let(:json) do
    {
      'query' => []
    }.to_json
  end

  it "queries yahoo!'s yql service" do
    RestClient.should_receive(:get).with("http://query.yahooapis.com/v1/public/yql", anything).and_return json
    Timeline.query_yql('query')
  end

  it "queries for json" do
    RestClient.should_receive(:get).with(anything, params_hash_including(:format => 'json')).and_return json
    Timeline.query_yql('query')
  end

  it "queries with the query term" do
    RestClient.should_receive(:get).with(anything, params_hash_including(:q => 'query for me')).and_return json
    Timeline.query_yql('query for me')
  end

  it "includes community opentable definitions" do
    RestClient.should_receive(:get).with(anything, params_hash_including(:env => 'store://datatables.org/alltableswithkeys')).and_return json
    Timeline.query_yql('query')
  end

  def params_hash_including(expected)
    ParamsIncludingMatcher.new(expected)
  end

  class ParamsIncludingMatcher
    def initialize(expected)
      @expected = expected
    end

    def ==(actual)
      key = @expected.keys.first
      value = @expected.values.first
      actual[:params][key].should == value
    end

    def description 
      "a hash including #{@expected}"
    end
  end
end

describe "Timeline.map_mendeley_hashes_to_timeline_hashes(list_of_hashes)" do
  subject do
    Timeline.map_mendeley_hashes_to_timeline_hashes(hash_list)
  end

  let(:hash_list) do
    [
      {'title' => 'junk'},
      {'title' => 'junk with year 0', 'year'=> '0'},
      { 'year' => '2000',
        'title' => 'shoes shoes shoes',
        'authors' => 'Zimmerman, D.',
        'publication_outlet' => 'Paulies',
        'mendeley_url' => 'http://yahoo.com'
      }
    ]
  end

  it "should filter out papers without associated years" do
    subject.length.should be(1)
  end

  it "maps year to start" do
    subject.first['start'].should == '2000'
  end

  it "keeps title" do
    subject.first['title'].should == 'shoes shoes shoes'
  end

  it "maps authors and publisher to description" do
    subject.first['description'].should == 'Zimmerman, D. -- Paulies'
  end

  it "maps mendeley_url to link" do
    subject.first['link'].should == 'http://yahoo.com'
  end
end