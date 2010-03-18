module JsonObject
  module Types
    class MultiSelect < Select
      def validate_value(values)
        @value_errors << "'#{values}' is not a subset of the list of valid options" unless values&options==values
      end

      def value_from_param(p)
        raise TypeError, "values for Jsonobject::Types::MultiSelect has to be an array of strings" unless p.is_a? Array
        p.reject {|e| e.blank?}
      end
      
    end
  end
end