module ActionView
  module Helpers
    def tree_select(object, method, collection, value_method, text_method, options = {}, html_options = {})
      options[:indent] = '&nbsp;&nbsp;' unless options[:indent]
      InstanceTag.new(object, method, self, options.delete(:object)).to_tree_select_tag(collection, value_method, text_method, options, html_options)
    end
    
    
    class InstanceTag #:nodoc:
      def options_from_tree_recursion(collection, value_method, text_method, options, html_options, level = 0)
        ret = ''
        collection.each do |item|          
          ret += '<option value="' + item.send(value_method).to_s + '"'
          unless object.nil?
            if item.id == object.id
              ret += ' disabled="disabled"'
            else
              if item.id == object.send(method_name)
                ret += ' selected="selected"'
              end
            end
          end
          ret += ' >'
          
          ret += options[:indent]*level
          ret += item.send(text_method).to_s
          ret += options_from_tree_recursion(item.children, value_method, text_method, options, html_options, level + 1) if item.children.size > 0
          ret += '</option>'
        end
        ret
      end

      def to_tree_select_tag(collection, value_method, text_method, options, html_options)        
        html_options = html_options.stringify_keys
        add_default_name_and_id(html_options)
        value = value(object)
        content_tag(
          "select", add_options(options_from_tree_recursion(collection, value_method, text_method, options, html_options, 0), options, value), html_options
        )
      end
    end
  end
end

module VrameHelper
  def tree_ul(acts_as_tree_set, init=true, &block)
    if acts_as_tree_set.size > 0
      ret = '<ul>'
      acts_as_tree_set.collect do |item|
        next if item.parent_id && init
        ret += '<li>'
        ret += yield item
        ret += tree_ul(item.children, false, &block) if item.children.size > 0
        ret += '</li>'
      end
      ret += '</ul>'
    end
  end
end