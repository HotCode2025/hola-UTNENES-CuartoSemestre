import math# NaN (Not a Number)
from decimal import Decimal

a = float('nan')
print(f'a: {a}')

# Módulo math
a = float('nan')
print(f'Es de tipo NaN(Not a Number)?: {math.isnan(a)}')

# Módulo decimal
a = Decimal('nan')
print(f'Es de tipo NaN(Not a Number)?: {math.isnan(a)}')