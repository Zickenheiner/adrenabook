import { IS_PUBLIC_KEY, Public } from './public.decorator';

describe('Public decorator', () => {
  it('should expose IS_PUBLIC_KEY with value "isPublic"', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });

  it('should attach the isPublic=true metadata when applied to a method', () => {
    class Sample {
      @Public()
      foo() {
        return 'bar';
      }
    }

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, Sample.prototype.foo);
    expect(metadata).toBe(true);
  });

  it('should attach the isPublic=true metadata when applied to a class', () => {
    @Public()
    class Sample {}

    const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, Sample);
    expect(metadata).toBe(true);
  });
});
