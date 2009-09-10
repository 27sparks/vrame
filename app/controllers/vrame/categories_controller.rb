class Vrame::CategoriesController < Vrame::VrameController
  def index
    per_page = params[:per_page] || 50
    
    @categories = Category.roots.paginate :page => params[:page], :per_page => per_page
    
    @ancestors = []
    
    render :show
  end
  
  def show
    per_page = params[:per_page] || 50
    
    @category = Category.find(params[:id])
    @categories = @category.children.paginate :page => params[:page], :per_page => per_page
    
    @breadcrumbs = [{ :title => 'Kategorien', :url => vrame_categories_path }]
    @category.ancestors.reverse.each { |a| @breadcrumbs << { :title => a.title, :url => vrame_category_path(a) } }
  end
  
  def new
    @category = Category.new
    if params[:category_id]
      @category.parent = Category.find(params[:category_id])
    end
    
    @breadcrumbs = [{ :title => 'Kategorien', :url => vrame_categories_path }]
    @category.ancestors.reverse.each { |a| @breadcrumbs << { :title => a.title, :url => vrame_category_path(a) } }
  end
  
  def edit
    @category = Category.find(params[:id])
  end
  
  def update
    @category = Category.find(params[:id])
    
    # Hash mapping workaround
    params[:category][:schema] = params[:schema]
    
    # Empty default values
    params[:category][:schema] ||= []
    params[:category][:meta] ||= {}

    if @category.update_attributes(params[:category])
      flash[:success] = 'Die Kategorie wurde aktualisiert'
      redirect_to :action => :index
    else
      flash[:error] = 'Es ist ein Fehler aufgetreten'
      render :action => :edit
    end    
  end  
  
  def create
    # Hash mapping workaround
    params[:category][:schema] = params[:schema]
    
    @category = Category.new(params[:category])
    
    if @category.save
      flash[:success] = 'Kategorie angelegt'
      redirect_to :action => :index
    else
      flash[:error] = 'Dokument konnte nicht angelegt werden'
      render :new
    end
 end
  
  def destroy
    @category = Category.find(params[:id])
    if @category.destroy
      flash[:success] = 'Die Kategorie wurde gelöscht'
    else
      flash[:error] = 'Die Kategorie konnte nicht gelöscht werden'  #TODO Error Messages hierhin
    end
    redirect_to :action => :index
  end  
  
  def order_up
    @category = Category.find(params[:id])
    @category.move_higher
    
    redirect_to :back
  end
  
  def order_down
    @category = Category.find(params[:id])
    @category.move_lower
    
    redirect_to :back
  end
end